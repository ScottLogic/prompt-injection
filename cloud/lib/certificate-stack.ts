import {
	Certificate,
	CertificateValidation,
	DnsValidatedCertificate,
	ICertificate,
} from 'aws-cdk-lib/aws-certificatemanager';
import { IHostedZone } from 'aws-cdk-lib/aws-route53';
import { Stack, StackProps } from 'aws-cdk-lib/core';
import { Construct } from 'constructs';

import { resourceName } from './resourceNamingUtils';

type CertificateStackProps = StackProps & {
	hostedZone: IHostedZone;
};

export class CertificateStack extends Stack {
	public readonly cloudFrontCert: ICertificate;
	public readonly loadBalancerCert: ICertificate;

	constructor(scope: Construct, id: string, props: CertificateStackProps) {
		super(scope, id, props);

		const { hostedZone } = props;
		const generateResourceName = resourceName(scope);

		const cloudFrontCertName = generateResourceName('certificate-cfront');
		// Yes this is deprecated, but CDK currently gives us no way to use
		// Permissions Boundaries with cross-region resources, so ...
		this.cloudFrontCert = new DnsValidatedCertificate(
			this,
			cloudFrontCertName,
			{
				certificateName: cloudFrontCertName,
				domainName: hostedZone.zoneName,
				subjectAlternativeNames: [`auth.${hostedZone.zoneName}`],
				hostedZone,
				validation: CertificateValidation.fromDns(hostedZone),
				region: 'us-east-1',
			}
		);

		const loadBalancerCertName = generateResourceName('certificate-alb');
		this.loadBalancerCert = new Certificate(this, loadBalancerCertName, {
			certificateName: loadBalancerCertName,
			domainName: `api.${hostedZone.zoneName}`,
			validation: CertificateValidation.fromDns(hostedZone),
		});
	}
}
