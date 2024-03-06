#!/usr/bin/env node
import { App, Environment } from 'aws-cdk-lib';
import 'source-map-support/register';

import {
	appName,
	environmentName,
	resourceDescription,
	stackName,
	ApiStack,
	AuthStack,
	RoutingStack,
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
	'keep-alive': '9-5-without-weekends',
};

const generateStackName = stackName(app);
const generateDescription = resourceDescription(app);

const routingStack = new RoutingStack(app, generateStackName('routing'), {
	description: generateDescription('Route 53 stack'),
	env,
	tags,
});

const uiStack = new UiStack(app, generateStackName('ui'), {
	description: generateDescription('UI stack'),
	env,
	tags,
	certificate: routingStack.certificate,
	hostedZone: routingStack.hostedZone,
});

/*const authStack = */ new AuthStack(app, generateStackName('auth'), {
	description: generateDescription('Auth stack'),
	env,
	tags,
	webappUrl: uiStack.cloudFrontUrl,
});

new ApiStack(app, generateStackName('api'), {
	description: generateDescription('API stack'),
	env,
	tags,
	certificate: routingStack.certificate,
	hostedZone: routingStack.hostedZone,
	// userPool: authStack.userPool,
	// userPoolClient: authStack.userPoolClient,
	// userPoolDomain: authStack.userPoolDomain,
	webappUrl: uiStack.cloudFrontUrl,
});
