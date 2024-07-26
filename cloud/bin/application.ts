#!/usr/bin/env node
import { App, Environment } from 'aws-cdk-lib/core';
import 'source-map-support/register';

import {
	appName,
	resourceDescription,
	resourceId,
	stackName,
	stageName,
	ApiStack,
	AuthStack,
	CertificateStack,
	HostedZoneStack,
	UiStack,
} from '../lib';

/*
This application can be used to test stack changes before they are deployed by
the production pipeline. See the cloud README for details.
*/

const app = new App();
const generateStackName = stackName(app);
const generateDescription = resourceDescription(app);

/* Common stack resources */

// NOTE: Need DOMAIN_NAME and HOSTED_ZONE_ID env vars, see "cloud/.env.example"
// If you have access to SpyLogic AWS account, these are viewable in Parameter Store.
const env: Environment = {
	account: process.env.CDK_DEFAULT_ACCOUNT,
	region: process.env.CDK_DEFAULT_REGION,
};

const tags = {
	owner: appName,
	stage: stageName(app),
};

/* Stack constructs */

const hostedZoneStack = new HostedZoneStack(app, generateStackName('hostedzone'), {
	description: generateDescription('Hosted Zone stack'),
	env,
	tags,
});

const certificateStack = new CertificateStack(app, generateStackName('certificate'), {
	description: generateDescription('Certificate stack'),
	env,
	tags,
	domainName: hostedZoneStack.topLevelDomain.value as string,
	hostedZone: hostedZoneStack.hostedZone,
});

const authStack = new AuthStack(app, generateStackName('auth'), {
	description: generateDescription('Auth stack'),
	env,
	tags,
	domainName: hostedZoneStack.topLevelDomain.value as string,
});

new ApiStack(app, generateStackName('api'), {
	description: generateDescription('API stack'),
	env,
	tags,
	apiDomainName: certificateStack.apiDomainName,
	certificate: certificateStack.loadBalancerCert,
	customAuthHeaderName: authStack.customAuthHeaderName,
	customAuthHeaderValue: authStack.customAuthHeaderValue,
	domainName: hostedZoneStack.topLevelDomain.value as string,
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
	domainName: hostedZoneStack.topLevelDomain.value as string,
	hostedZone: hostedZoneStack.hostedZone,
	hostBucketName: resourceId(app)('host-bucket'),
	parameterNameUserPoolClient: authStack.parameterNameUserPoolClient,
	parameterNameUserPoolId: authStack.parameterNameUserPoolId,
});
