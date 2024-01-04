import {
	AllowedMethods,
	Distribution,
	OriginAccessIdentity,
	SecurityPolicyProtocol,
	ViewerProtocolPolicy,
} from 'aws-cdk-lib/aws-cloudfront';
import { S3Origin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { CfnOutput, Duration, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib/core';
import * as iam from 'aws-cdk-lib/aws-iam';
import {
	BlockPublicAccess,
	Bucket,
	BucketEncryption,
} from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

import { resourceName } from './resourceNamingUtils';

export class UiStack extends Stack {
	public readonly cloudfrontUrl: string;

	constructor(scope: Construct, id: string, props: StackProps) {
		super(scope, id, props);

		const generateResourceName = resourceName(scope);

		// allow s3 to be secured
		const cloudfrontOAI = new OriginAccessIdentity(
			this,
			generateResourceName('cloudfront-OAI')
		);

		//HostBucket
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
			new iam.PolicyStatement({
				actions: ['s3:GetObject'],
				resources: [hostBucket.arnForObjects('*')],
				principals: [
					new iam.CanonicalUserPrincipal(
						cloudfrontOAI.cloudFrontOriginAccessIdentityS3CanonicalUserId
					),
				],
			})
		);

		//CloudFront
		const cloudFront = new Distribution(
			this,
			generateResourceName('site-distribution'),
			{
				defaultRootObject: 'index.html',
				minimumProtocolVersion: SecurityPolicyProtocol.TLS_V1_2_2021,
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
					compress: true,
					allowedMethods: AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
					viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
				},
			}
		);
		this.cloudfrontUrl = `https://${cloudFront.domainName}`;

		new CfnOutput(this, 'WebURL', {
			value: this.cloudfrontUrl,
		});
	}
}
