import { HostedZone, IHostedZone } from 'aws-cdk-lib/aws-route53';
import { Stack, StackProps } from 'aws-cdk-lib/core';
import { Construct } from 'constructs';

import { resourceName } from './resourceNamingUtils';

export class HostedZoneStack extends Stack {
	public readonly hostedZone: IHostedZone;

	constructor(scope: Construct, id: string, props: StackProps) {
		super(scope, id, props);

		const { DOMAIN_NAME, HOSTED_ZONE_ID } = process.env;
		if (!DOMAIN_NAME) {
			throw new Error('DOMAIN_NAME not found in env vars');
		}
		if (!HOSTED_ZONE_ID) {
			throw new Error('HOSTED_ZONE_ID not found in env vars');
		}

		this.hostedZone = HostedZone.fromHostedZoneAttributes(
			this,
			resourceName(scope)('hosted-zone'),
			{
				hostedZoneId: HOSTED_ZONE_ID,
				zoneName: DOMAIN_NAME,
			}
		);
	}
}
