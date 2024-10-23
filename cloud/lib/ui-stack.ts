import { TypeScriptCode } from '@mrgrain/cdk-esbuild';
import { ICertificate } from 'aws-cdk-lib/aws-certificatemanager';
import {
	AllowedMethods,
	CacheCookieBehavior,
	CachePolicy,
	Distribution,
	experimental,
	LambdaEdgeEventType,
	OriginRequestPolicy,
	PriceClass,
	ResponseHeadersPolicy,
	ViewerProtocolPolicy,
} from 'aws-cdk-lib/aws-cloudfront';
import { HttpOrigin, S3BucketOrigin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { AaaaRecord, ARecord, IHostedZone, RecordTarget } from 'aws-cdk-lib/aws-route53';
import { CloudFrontTarget } from 'aws-cdk-lib/aws-route53-targets';
import { BlockPublicAccess, Bucket, BucketEncryption } from 'aws-cdk-lib/aws-s3';
import { CfnOutput, Duration, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import { join } from 'node:path';

import { appName, resourceId, stackName, stageName } from './resourceNamingUtils';

type UiStackProps = StackProps & {
	apiDomainName: string;
	certificate: ICertificate;
	customAuthHeaderName: string;
	customAuthHeaderValue: string;
	domainName: string;
	hostedZone: IHostedZone;
	hostBucketName: string;
	parameterNameUserPoolClient: string;
	parameterNameUserPoolId: string;
};

export class UiStack extends Stack {
	public readonly cloudFrontDistributionId: CfnOutput;

	constructor(scope: Construct, id: string, props: UiStackProps) {
		super(scope, id, props);

		const generateResourceId = resourceId(scope);
		const stage = stageName(scope);

		const {
			apiDomainName,
			certificate,
			customAuthHeaderName,
			customAuthHeaderValue,
			domainName,
			env,
			hostedZone,
			hostBucketName,
			parameterNameUserPoolClient,
			parameterNameUserPoolId,
		} = props;

		if (!env?.region) {
			throw new Error('Region not defined in stack env, cannot continue!');
		}

		/*
		UI Host Bucket
		*/
		const hostBucket = new Bucket(this, hostBucketName, {
			bucketName: hostBucketName,
			blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
			encryption: BucketEncryption.S3_MANAGED,
			versioned: false,
			removalPolicy: RemovalPolicy.DESTROY,
			autoDeleteObjects: true,
		});

		/*
		Edge lambda as JWT token verifier, to check request has access token
			- YES and valid: add custom header with UUID that ALB will filter on
			- NO or invalid: return 401 Unauthorized

		TODO
		Once we have a pipeline, could we inject the jwks.json during a build step?
		If so, we might be able to switch to a CloudFront Function instead of Edge,
		and use CloudFront KeyValueStore to hold our jwks value as JSON.
		*/
		const edgeFunctionName = generateResourceId('api-gatekeeper');
		const verifierEdgeFunction = new experimental.EdgeFunction(this, edgeFunctionName, {
			stackId: stackName(scope)('edge-lambda'),
			functionName: edgeFunctionName,
			handler: 'index.handler',
			runtime: Runtime.NODEJS_20_X,
			code: new TypeScriptCode(join(__dirname, 'lambdas/verifyAuth/index.ts'), {
				buildOptions: {
					bundle: true,
					external: ['@aws-sdk/client-ssm'],
					minify: false,
					platform: 'node',
					target: 'node20',
					define: {
						'process.env.DOMAIN_NAME': `"${domainName}"`,
						'process.env.AWS_REGION': `"${env.region}"`,
						'process.env.PARAM_USERPOOL_ID': `"${parameterNameUserPoolId}"`,
						'process.env.PARAM_USERPOOL_CLIENT': `"${parameterNameUserPoolClient}"`,
					},
				},
			}),
		});
		verifierEdgeFunction.addToRolePolicy(
			new PolicyStatement({
				effect: Effect.ALLOW,
				actions: ['ssm:GetParameters'],
				resources: ['*'],
			})
		);

		/*
		Main CloudFront distribution

		Includes API proxy to verify user is authorized and add a custom header; load balancer
		can then use this as a filter, to only accept authorized requests from CloudFront.
		*/
		const albOrigin = new HttpOrigin(apiDomainName, {
			customHeaders: {
				[customAuthHeaderName]: customAuthHeaderValue,
			},
		});
		const siteDistribution = new Distribution(this, generateResourceId('site-distribution'), {
			defaultRootObject: 'index.html',
			certificate,
			domainNames: [domainName],
			enableLogging: true,
			errorResponses: [
				{
					httpStatus: 404,
					responseHttpStatus: 200,
					responsePagePath: '/index.html',
					ttl: Duration.seconds(30),
				},
			],
			defaultBehavior: {
				origin: S3BucketOrigin.withOriginAccessControl(hostBucket),
				cachePolicy: new CachePolicy(this, generateResourceId('site-cache-policy'), {
					// TODO Try removing this: cookie should only be needed on backend calls
					cookieBehavior: CacheCookieBehavior.allowList(`${appName}.sid`),
				}),
				compress: true,
				allowedMethods: AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
				viewerProtocolPolicy: ViewerProtocolPolicy.HTTPS_ONLY,
			},
			additionalBehaviors: {
				'/api/documents/*': {
					// Cache static content, currently just docs
					origin: albOrigin,
					cachePolicy: new CachePolicy(this, generateResourceId('static-resources'), {
						comment: 'Long-lived cache for static files, invalidation forced after redeploy',
						minTtl: Duration.days(14),
					}),
					viewerProtocolPolicy: ViewerProtocolPolicy.HTTPS_ONLY,
					originRequestPolicy: OriginRequestPolicy.ALL_VIEWER_EXCEPT_HOST_HEADER,
					responseHeadersPolicy: ResponseHeadersPolicy.SECURITY_HEADERS,
					edgeLambdas: [
						{
							functionVersion: verifierEdgeFunction.currentVersion,
							eventType: LambdaEdgeEventType.VIEWER_REQUEST,
						},
					],
				},
				'/api/*': {
					// Treat all other paths as dynamic, do not cache
					origin: albOrigin,
					allowedMethods: AllowedMethods.ALLOW_ALL,
					cachePolicy: CachePolicy.CACHING_DISABLED,
					viewerProtocolPolicy: ViewerProtocolPolicy.HTTPS_ONLY,
					originRequestPolicy: OriginRequestPolicy.ALL_VIEWER_EXCEPT_HOST_HEADER,
					responseHeadersPolicy: ResponseHeadersPolicy.SECURITY_HEADERS,
					edgeLambdas: [
						{
							functionVersion: verifierEdgeFunction.currentVersion,
							eventType: LambdaEdgeEventType.VIEWER_REQUEST,
						},
					],
				},
			},
			priceClass: PriceClass.PRICE_CLASS_100,
		});
		this.cloudFrontDistributionId = new CfnOutput(this, 'CloudFrontDistributionId', {
			value: siteDistribution.distributionId,
			exportName: `${this.stackName}-CloudFrontDistributionId`,
		});

		/*
		DNS Records for Route53
		*/
		const websiteTarget = RecordTarget.fromAlias(new CloudFrontTarget(siteDistribution));
		new ARecord(this, generateResourceId('arecord-cfront'), {
			zone: hostedZone,
			recordName: domainName,
			target: websiteTarget,
			deleteExisting: true,
			comment: `DNS A Record for UI host (${stage})`,
		});
		new AaaaRecord(this, generateResourceId('aaaarecord-cfront'), {
			zone: hostedZone,
			recordName: domainName,
			target: websiteTarget,
			deleteExisting: true,
			comment: `DNS AAAA Record for UI host (${stage})`,
		});
	}
}
