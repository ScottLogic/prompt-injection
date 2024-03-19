import { ICertificate } from 'aws-cdk-lib/aws-certificatemanager';
import {
	AllowedMethods,
	CacheCookieBehavior,
	CachePolicy,
	Distribution,
	experimental,
	LambdaEdgeEventType,
	OriginAccessIdentity, OriginRequestPolicy,
	PriceClass, ResponseHeadersPolicy,
	ViewerProtocolPolicy,
} from 'aws-cdk-lib/aws-cloudfront';
import { HttpOrigin, S3Origin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { CanonicalUserPrincipal, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Code, Runtime } from 'aws-cdk-lib/aws-lambda';
import { AaaaRecord, ARecord, IHostedZone, RecordTarget, } from 'aws-cdk-lib/aws-route53';
import { CloudFrontTarget } from 'aws-cdk-lib/aws-route53-targets';
import { BlockPublicAccess, Bucket, BucketEncryption, } from 'aws-cdk-lib/aws-s3';
import { Duration, RemovalPolicy, Stack, StackProps, } from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import { join } from 'node:path';

import { appName, resourceName } from './resourceNamingUtils';

type UiStackProps = StackProps & {
	certificate: ICertificate;
	hostedZone: IHostedZone;
};

export class UiStack extends Stack {
	constructor(scope: Construct, id: string, props: UiStackProps) {
		super(scope, id, props);

		const generateResourceName = resourceName(scope);
		const { certificate, env, hostedZone } = props;
		const authDomainName = `auth.${hostedZone.zoneName}`;

		if (!env?.region) {
			throw new Error('Region not defined in stack env, cannot continue!');
		}

		const cloudfrontOAI = new OriginAccessIdentity(
			this,
			generateResourceName('cloudfront-OAI')
		);

		// Host Bucket
		const bucketName = generateResourceName('host-bucket');
		const hostBucket = new Bucket(this, bucketName, {
			bucketName,
			blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
			encryption: BucketEncryption.S3_MANAGED,
			versioned: false,
			removalPolicy: RemovalPolicy.DESTROY,
			autoDeleteObjects: true,
		});
		hostBucket.addToResourcePolicy(
			new PolicyStatement({
				actions: ['s3:GetObject'],
				resources: [hostBucket.arnForObjects('*')],
				principals: [
					new CanonicalUserPrincipal(
						cloudfrontOAI.cloudFrontOriginAccessIdentityS3CanonicalUserId
					),
				],
			})
		);

		// Main CloudFront distribution
		const cachePolicyName = generateResourceName('site-cache-policy');
		const websiteDistribution = new Distribution(
			this,
			generateResourceName('site-distribution'),
			{
				defaultRootObject: 'index.html',
				certificate,
				domainNames: [hostedZone.zoneName],
				errorResponses: [
					{
						httpStatus: 404,
						responseHttpStatus: 200,
						responsePagePath: '/index.html',
						ttl: Duration.seconds(30),
					},
				],
				defaultBehavior: {
					origin: new S3Origin(hostBucket, {
						originAccessIdentity: cloudfrontOAI,
					}),
					cachePolicy: new CachePolicy(this, cachePolicyName, {
						cachePolicyName,
						cookieBehavior: CacheCookieBehavior.allowList(`${appName}.sid`),
					}),
					compress: true,
					allowedMethods: AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
					viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
				},
				priceClass: PriceClass.PRICE_CLASS_100,
			}
		);

		// TODO Edge function to verify auth token for API requests
		const authFunctionName = generateResourceName('auth-interceptor');
		const cognitoAuthEdgeFunction = new experimental.EdgeFunction(this, authFunctionName, {
			functionName: authFunctionName,
			handler: 'index.handler',
			runtime: Runtime.NODEJS_18_X,
			code: Code.fromAsset(join(__dirname, 'lambdas/build/addCognitoSecret')),
		});

		// TODO API proxy distribution for auth token verification! Use aws-jwt-verify

		// Cognito proxy distribution
		const cognitoProxyDistribution = new Distribution(this, generateResourceName('cognito-proxy'), {
			certificate,
			domainNames: [authDomainName],
			enableLogging: true,
			defaultBehavior: {
				origin: new HttpOrigin(`cognito-idp.${env.region}.amazonaws.com`),
				allowedMethods: AllowedMethods.ALLOW_ALL,
				cachePolicy: CachePolicy.CACHING_DISABLED,
				viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
				originRequestPolicy: OriginRequestPolicy.ALL_VIEWER_AND_CLOUDFRONT_2022,
				responseHeadersPolicy: ResponseHeadersPolicy.CORS_ALLOW_ALL_ORIGINS_WITH_PREFLIGHT_AND_SECURITY_HEADERS,
			},
			priceClass: PriceClass.PRICE_CLASS_100,
		});

		// DNS Records for Route53
		const websiteTarget = RecordTarget.fromAlias(
			new CloudFrontTarget(websiteDistribution)
		);
		const authTarget = RecordTarget.fromAlias(
			new CloudFrontTarget(cognitoProxyDistribution)
		);
		new ARecord(this, generateResourceName('arecord-cfront'), {
			zone: hostedZone,
			target: websiteTarget,
			deleteExisting: true,
			comment: 'DNS A Record for the UI host',
		});
		new AaaaRecord(this, generateResourceName('aaaarecord-cfront'), {
			zone: hostedZone,
			target: websiteTarget,
			deleteExisting: true,
			comment: 'DNS AAAA Record for the UI host',
		});
		new ARecord(this, generateResourceName('arecord-auth-proxy'), {
			zone: hostedZone,
			recordName: authDomainName,
			target: authTarget,
			deleteExisting: true,
			comment: 'DNS A Record for Cognito auth proxy',
		});
	}
}
