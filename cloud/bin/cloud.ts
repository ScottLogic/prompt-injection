#!/usr/bin/env node
import { App, Environment } from 'aws-cdk-lib';
import 'source-map-support/register';

import {
	appName,
	resourceDescription,
	stackName,
	stageName,
	ApiStack,
	AuthStack,
	UiStack,
} from '../lib';

const app = new App();

const awsEnv = (): Environment => ({
	account: process.env.CDK_DEFAULT_ACCOUNT,
	region: process.env.CDK_DEFAULT_REGION,
});

const tags = {
	Project: appName,
	Environment: stageName(app).toUpperCase(),
	IaC: 'CDK',
};

const generateStackName = stackName(app);
const generateDescription = resourceDescription(app);

const uiStack = new UiStack(app, generateStackName('ui'), {
	env: awsEnv(),
	tags,
	description: generateDescription('UI stack'),
});

// Don't need this stack, yet... Or ever? Will ask Pete C.
/*
const authStack = new AuthStack(app, generateStackName('auth'), {
	env: awsEnv(),
	tags,
	description: generateDescription('Auth stack'),
	webappUrl: uiStack.cloudfrontUrl,
});
*/

new ApiStack(app, generateStackName('api'), {
	env: awsEnv(),
	tags,
	description: generateDescription('API stack'),
	// userPool: authStack.userPool,
	// userPoolClient: authStack.userPoolClient,
	// userPoolDomain: authStack.userPoolDomain,
	webappUrl: uiStack.cloudfrontUrl,
});
