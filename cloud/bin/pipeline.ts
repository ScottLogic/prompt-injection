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

const generateStackName = stackName(app);
const generateDescription = resourceDescription(app);

/* Pipeline is now responsible for deploying all other Stacks */

const pipelineUsEast1StackName = generateStackName('pipeline-useast1');
const pipelineUsEast1Stack = new PipelineAssistUsEast1Stack(app, pipelineUsEast1StackName, {
	stackName: pipelineUsEast1StackName,
	description: generateDescription('Code Pipeline Cross-Region resources stack (us-east-1)'),
	env,
	tags,
});

const pipelineStackName = generateStackName('pipeline');
new PipelineStack(app, pipelineStackName, {
	stackName: pipelineStackName,
	description: generateDescription('Code Pipeline stack'),
	env,
	tags,
	usEast1Bucket: pipelineUsEast1Stack.resourceBucket,
});
