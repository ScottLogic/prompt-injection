#!/usr/bin/env node
import { App, Environment } from 'aws-cdk-lib/core';
import 'source-map-support/register';

import {
	appName,
	resourceDescription,
	stackName,
	stageName,
	PipelineAssistUsEast1Stack,
	PipelineStack,
} from '../lib';

const app = new App();

/* Common stack resources */

const env: Environment = {
	account: process.env.CDK_DEFAULT_ACCOUNT,
	region: process.env.CDK_DEFAULT_REGION,
};

const tags = {
	owner: appName,
	stage: stageName(app),
};

/* Pipeline is now responsible for deploying all other Stacks */

const pipelineUsEast1Stack = new PipelineAssistUsEast1Stack(
	app,
	stackName(app)('pipeline-useast1'),
	{
		description: resourceDescription(app)('Code Pipeline Cross-Region resources stack (us-east-1)'),
		env,
		tags,
	}
);

new PipelineStack(app, stackName(app)('pipeline'), {
	description: resourceDescription(app)('Code Pipeline stack'),
	env,
	tags,
	usEast1Bucket: pipelineUsEast1Stack.resourceBucket,
});
