#!/usr/bin/env node
import { App, Environment } from 'aws-cdk-lib';
import 'source-map-support/register';

import {
	appName,
	environmentName,
	resourceDescription,
	stackName,
	ApiStack,
	UiStack,
} from '../lib';

const app = new App();

const env: Environment = {
	account: process.env.CDK_DEFAULT_ACCOUNT,
	region: process.env.CDK_DEFAULT_REGION,
};

const tags = {
	owner: appName,
	classification: 'unrestricted',
	'environment-type': environmentName(app),
	'keep-alive': '8-6-without-weekends',
	IaC: 'CDK',
};

const generateStackName = stackName(app);
const generateDescription = resourceDescription(app);

const uiStack = new UiStack(app, generateStackName('ui'), {
	description: generateDescription('UI stack'),
	env,
	tags,
});

// Don't need this stack yet.
/*
const authStack = new AuthStack(app, generateStackName('auth'), {
	description: generateDescription('Auth stack'),
	env,
	tags,
	webappUrl: uiStack.cloudfrontUrl,
});
*/

new ApiStack(app, generateStackName('api'), {
	description: generateDescription('API stack'),
	env,
	tags,
	// userPool: authStack.userPool,
	// userPoolClient: authStack.userPoolClient,
	// userPoolDomain: authStack.userPoolDomain,
	webappUrl: uiStack.cloudfrontUrl,
});
