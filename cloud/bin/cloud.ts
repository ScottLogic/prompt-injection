#!/usr/bin/env node
import { App } from 'aws-cdk-lib';
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
const tags = {
	Project: appName,
	App: appName,
	Environment: stageName(app).toUpperCase(),
	IaC: 'CDK',
};

const generateStackName = stackName(app);
const generateDescription = resourceDescription(app);

const uiStack = new UiStack(app, generateStackName('ui'), {
	tags,
	description: generateDescription('UI stack'),
});

const authStack = new AuthStack(app, generateStackName('auth'), {
	tags,
	description: generateDescription('Auth stack'),
	webappUrl: uiStack.cloudfrontUrl,
});

new ApiStack(app, generateStackName('api'), {
	tags,
	description: generateDescription('API stack'),
	userPool: authStack.userPool,
	userPoolClient: authStack.userPoolClient,
	userPoolDomain: authStack.userPoolDomain,
	webappUrl: uiStack.cloudfrontUrl,
});
