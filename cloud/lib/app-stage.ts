import { CfnOutput, Stage, type StackProps, type StageProps } from 'aws-cdk-lib/core';
import { Construct } from 'constructs';

import { ApiStack } from './api-stack';
import { AuthStack } from './auth-stack';
import { CertificateStack } from './certificate-stack';
import { HostedZoneStack } from './hostedzone-stack';
import { resourceDescription, stackName } from './resourceNamingUtils';
import { UiStack } from './ui-stack';

type AppStageProps = StageProps & {
	tags: StackProps['tags'];
	hostBucketName: string;
};

export class AppStage extends Stage {
	public readonly cloudFrontDistributionId: CfnOutput;
	public readonly domainName: CfnOutput;
	public readonly redirectUrl: CfnOutput;
	public readonly backendUrl: CfnOutput;
	public readonly userpoolId: CfnOutput;
	public readonly userpoolClient: CfnOutput;
	public readonly userpoolDomain: CfnOutput;

	constructor(scope: Construct, id: string, props: AppStageProps) {
		super(scope, id, props);

		const { env, hostBucketName, tags } = props;

		const generateDescription = resourceDescription(scope);
		const generateStackName = stackName(scope);

		const hostedZoneStack = new HostedZoneStack(this, generateStackName('hostedzone'), {
			description: generateDescription('Hosted Zone stack'),
			env,
			tags,
		});

		const certificateStack = new CertificateStack(this, generateStackName('certificate'), {
			description: generateDescription('Certificate stack'),
			env,
			tags,
			domainName: hostedZoneStack.topLevelDomain.value as string,
			hostedZone: hostedZoneStack.hostedZone,
		});

		const authStack = new AuthStack(this, generateStackName('auth'), {
			description: generateDescription('Auth stack'),
			env,
			tags,
			domainName: hostedZoneStack.topLevelDomain.value as string,
		});

		new ApiStack(this, generateStackName('api'), {
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

		const uiStack = new UiStack(this, generateStackName('ui'), {
			description: generateDescription('UI stack'),
			env,
			tags,
			hostBucketName,
			apiDomainName: certificateStack.apiDomainName,
			certificate: certificateStack.cloudFrontCert,
			customAuthHeaderName: authStack.customAuthHeaderName,
			customAuthHeaderValue: authStack.customAuthHeaderValue,
			domainName: hostedZoneStack.topLevelDomain.value as string,
			hostedZone: hostedZoneStack.hostedZone,
			parameterNameUserPoolClient: authStack.parameterNameUserPoolClient,
			parameterNameUserPoolId: authStack.parameterNameUserPoolId,
		});

		/*
		EXPOSE STACK OUTPUTS FOR PIPELINE
		*/
		this.cloudFrontDistributionId = uiStack.cloudFrontDistributionId;
		this.domainName = hostedZoneStack.topLevelDomain;
		this.redirectUrl = hostedZoneStack.hostUrl;
		this.backendUrl = hostedZoneStack.backendUrl;
		this.userpoolId = authStack.userPoolId;
		this.userpoolClient = authStack.userPoolClient;
		this.userpoolDomain = authStack.userPoolDomain;
	}
}
