#!/usr/bin/env node
import { App, Environment } from 'aws-cdk-lib/core';
import 'source-map-support/register';

import {
	appName,
	resourceDescription,
	stackName,
	stageName,
	ApiStack,
	AuthStack,
	CertificateStack,
	HostedZoneStack,
	UiStack,
} from '../lib';

const app = new App();
const generateStackName = stackName(app);
const generateDescription = resourceDescription(app);

/* Common stack resources */

const env: Environment = {
	account: process.env.CDK_DEFAULT_ACCOUNT,
	region: process.env.CDK_DEFAULT_REGION,
};

const tags = {
	owner: appName,
	stage: stageName(app),
};

/* Stack constructs */

const hostedZoneStack = new HostedZoneStack(
	app,
	generateStackName('hosted-zone'),
	{
		description: generateDescription('Hosted Zone stack'),
		env,
		tags,
	}
);

const certificateStack = new CertificateStack(
	app,
	generateStackName('certificate'),
	{
		description: generateDescription('Certificate stack'),
		env,
		tags,
		hostedZone: hostedZoneStack.hostedZone,
	}
);

const authStack = new AuthStack(app, generateStackName('auth'), {
	description: generateDescription('Auth stack'),
	env,
	tags,
	authDomainName: certificateStack.authDomainName,
	certificate: certificateStack.cloudFrontCert,
	hostedZone: hostedZoneStack.hostedZone,
});

new ApiStack(app, generateStackName('api'), {
	description: generateDescription('API stack'),
	env,
	tags,
	apiDomainName: certificateStack.apiDomainName,
	certificate: certificateStack.loadBalancerCert,
	customAuthHeaderName: authStack.customAuthHeaderName,
	customAuthHeaderValue: authStack.customAuthHeaderValue,
	hostedZone: hostedZoneStack.hostedZone,
});

new UiStack(app, generateStackName('ui'), {
	description: generateDescription('UI stack'),
	env,
	tags,
	apiDomainName: certificateStack.apiDomainName,
	certificate: certificateStack.cloudFrontCert,
	customAuthHeaderName: authStack.customAuthHeaderName,
	customAuthHeaderValue: authStack.customAuthHeaderValue,
	hostedZone: hostedZoneStack.hostedZone,
	parameterNameUserPoolClient: authStack.parameterNameUserPoolClient,
	parameterNameUserPoolId: authStack.parameterNameUserPoolId,
});
