import { HostedZone, IHostedZone } from 'aws-cdk-lib/aws-route53';
import { CfnOutput, Stack, StackProps } from 'aws-cdk-lib/core';
import { Construct } from 'constructs';

import { resourceId, stageName } from './resourceNamingUtils';

export class HostedZoneStack extends Stack {
	public readonly hostedZone: IHostedZone;
	public readonly topLevelDomain: CfnOutput;
	public readonly hostUrl: CfnOutput;
	public readonly backendUrl: CfnOutput;

	constructor(scope: Construct, id: string, props: StackProps) {
		super(scope, id, props);

		const { DOMAIN_NAME, HOSTED_ZONE_ID } = process.env;
		if (!DOMAIN_NAME) {
			throw new Error('DOMAIN_NAME not found in env vars');
		}
		if (!HOSTED_ZONE_ID) {
			throw new Error('HOSTED_ZONE_ID not found in env vars');
		}

		const stage = stageName(scope);

		this.hostedZone = HostedZone.fromHostedZoneAttributes(this, resourceId(scope)('hostedzone'), {
			hostedZoneId: HOSTED_ZONE_ID,
			zoneName: DOMAIN_NAME,
		});

		const hostDomainName =
			stage === 'prod' ? this.hostedZone.zoneName : `${stage}.${this.hostedZone.zoneName}`;

		this.topLevelDomain = new CfnOutput(this, 'TopLevelDomainName', {
			value: hostDomainName,
		});
		this.hostUrl = new CfnOutput(this, 'HostUrl', {
			value: `https://${hostDomainName}`,
		});
		this.backendUrl = new CfnOutput(this, 'BackendUrl', {
			value: `https://${hostDomainName}/api`,
		});
	}
}
