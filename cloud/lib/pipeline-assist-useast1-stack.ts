import { Bucket, IBucket } from 'aws-cdk-lib/aws-s3';
import { RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib/core';
import { Construct } from 'constructs';

import { resourceId } from './resourceNamingUtils';

export class PipelineAssistUsEast1Stack extends Stack {
	public readonly resourceBucket: IBucket;

	constructor(scope: Construct, id: string, props: StackProps) {
		super(scope, id, {
			...props,
			env: {
				...props.env,
				region: 'us-east-1',
			},
		});

		const bucketName = resourceId(scope)('pipeline-bucket-useast1');
		this.resourceBucket = new Bucket(this, bucketName, {
			bucketName,
			removalPolicy: RemovalPolicy.DESTROY,
			autoDeleteObjects: true,
		});
	}
}
