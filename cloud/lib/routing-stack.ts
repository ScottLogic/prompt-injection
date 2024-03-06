import {
	Certificate,
	CertificateValidation,
	ICertificate,
} from 'aws-cdk-lib/aws-certificatemanager';
import { HostedZone, IHostedZone } from 'aws-cdk-lib/aws-route53';
import { RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib/core';
import { Construct } from 'constructs';

import { resourceName } from './resourceNamingUtils';

export class RoutingStack extends Stack {
	public readonly certificate: ICertificate;
	public readonly hostedZone: IHostedZone;

	constructor(scope: Construct, id: string, props: StackProps) {
		super(scope, id, props);

		const generateResourceName = resourceName(scope);

		const { DOMAIN_NAME, HOSTED_ZONE_ID } = process.env;
		if (!HOSTED_ZONE_ID)
			throw new Error('HOSTED_ZONE_ID not found in env vars');
		if (!DOMAIN_NAME) throw new Error('DOMAIN_NAME not found in env vars');

		this.hostedZone = HostedZone.fromHostedZoneAttributes(
			this,
			generateResourceName('hosted-zone'),
			{
				hostedZoneId: HOSTED_ZONE_ID,
				zoneName: DOMAIN_NAME,
			}
		);
		this.hostedZone.applyRemovalPolicy(RemovalPolicy.RETAIN);

		const certificateName = generateResourceName('ssl-certificate');
		this.certificate = new Certificate(this, certificateName, {
			certificateName,
			domainName: DOMAIN_NAME,
			validation: CertificateValidation.fromDns(this.hostedZone),
		});
	}
}
