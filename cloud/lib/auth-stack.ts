import { ICertificate } from 'aws-cdk-lib/aws-certificatemanager';
import {
	AllowedMethods,
	CachePolicy,
	Distribution,
	OriginRequestPolicy,
	PriceClass,
	ResponseHeadersPolicy,
	ViewerProtocolPolicy,
} from 'aws-cdk-lib/aws-cloudfront';
import { HttpOrigin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { Mfa, OAuthScope, UserPool } from 'aws-cdk-lib/aws-cognito';
import { ARecord, IHostedZone, RecordTarget } from 'aws-cdk-lib/aws-route53';
import { CloudFrontTarget } from 'aws-cdk-lib/aws-route53-targets';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import { CfnOutput, Duration, RemovalPolicy, Stack, StackProps, Tags } from 'aws-cdk-lib/core';
import { Construct } from 'constructs';

import { resourceId, stageName } from './resourceNamingUtils';

type AuthStackProps = StackProps & {
	certificate: ICertificate;
	hostedZone: IHostedZone;
	authDomainName: string;
};

export class AuthStack extends Stack {
	public readonly customAuthHeaderName = 'X-Origin-Verified';
	public readonly customAuthHeaderValue = 'todo-generate-uuid-in-pipeline';
	public readonly parameterNameUserPoolId: string;
	public readonly parameterNameUserPoolClient: string;

	constructor(scope: Construct, id: string, props: AuthStackProps) {
		super(scope, id, props);

		const stage = stageName(scope);
		const generateResourceId = resourceId(scope);

		const { certificate, env, hostedZone, authDomainName } = props;
		if (!env?.region) {
			throw new Error('Region not defined in stack env, cannot continue!');
		}

		// Cognito UserPool
		const userPool = new UserPool(this, generateResourceId('userpool'), {
			enableSmsRole: false,
			mfa: Mfa.OFF,
			signInCaseSensitive: false,
			autoVerify: { email: false }, // will be sending email invite anyway
			selfSignUpEnabled: false, // only users we explicity allow
			standardAttributes: {
				givenName: { required: true },
				familyName: { required: true },
				email: { required: true },
			},
			signInAliases: { email: true },
			passwordPolicy: {
				minLength: 16,
				requireSymbols: false,
				requireLowercase: true,
				requireUppercase: true,
				requireDigits: true,
			},
			deletionProtection: false,
			removalPolicy: RemovalPolicy.DESTROY,
		});
		// Tags not correctly assigned from parent stack: https://github.com/aws/aws-cdk/issues/14127
		Object.entries(props.tags ?? {}).forEach(([key, value]) => {
			Tags.of(userPool).add(key, value);
		});

		new CfnOutput(this, 'UserPool.Id', {
			value: `urn:amazon:cognito:sp:${userPool.userPoolId}`,
		});

		const logoutUrls = [`https://${hostedZone.zoneName}`];
		const callbackUrls = logoutUrls.concat(`https://api.${hostedZone.zoneName}/oauth2/idpresponse`);
		const userPoolClient = userPool.addClient(generateResourceId('userpool-client'), {
			authFlows: {
				userSrp: true,
			},
			oAuth: {
				flows: {
					authorizationCodeGrant: true,
				},
				scopes: [OAuthScope.OPENID, OAuthScope.EMAIL, OAuthScope.PROFILE],
				callbackUrls,
				logoutUrls,
			},
			accessTokenValidity: Duration.minutes(60),
			idTokenValidity: Duration.minutes(60),
			refreshTokenValidity: Duration.days(14),
			enableTokenRevocation: true,
			preventUserExistenceErrors: true,
		});

		userPool.addDomain(generateResourceId('userpool-domain'), {
			cognitoDomain: {
				domainPrefix: generateResourceId('auth'),
			},
		});

		new CfnOutput(this, 'UserPoolClient.Id', {
			value: userPoolClient.userPoolClientId,
		});

		/*
		Use a CloudFront distribution to proxy Cognito.

		Why? Turns out a custom userpool domain won't work due to CORS failures :(
		Cognito does that by creating a CloudFront distro under the hood, so we're
		not adding any costs by configuring this manually.
		*/
		const cognitoProxyDistribution = new Distribution(this, generateResourceId('cognito-proxy'), {
			certificate,
			domainNames: [authDomainName],
			enableLogging: true,
			defaultBehavior: {
				origin: new HttpOrigin(`cognito-idp.${env.region}.amazonaws.com`),
				allowedMethods: AllowedMethods.ALLOW_ALL,
				cachePolicy: CachePolicy.CACHING_DISABLED,
				viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
				originRequestPolicy: OriginRequestPolicy.ALL_VIEWER_AND_CLOUDFRONT_2022,
				responseHeadersPolicy:
					ResponseHeadersPolicy.CORS_ALLOW_ALL_ORIGINS_WITH_PREFLIGHT_AND_SECURITY_HEADERS,
			},
			priceClass: PriceClass.PRICE_CLASS_100,
		});

		new ARecord(this, generateResourceId('arecord-auth-proxy'), {
			zone: hostedZone,
			recordName: authDomainName,
			target: RecordTarget.fromAlias(new CloudFrontTarget(cognitoProxyDistribution)),
			deleteExisting: true,
			comment: 'DNS A Record for Cognito auth proxy',
		});

		// SSM Parameters accessed in auth edge lambda, as cannot use ENV vars.
		this.parameterNameUserPoolId = `/${stage}/userpool-id`;
		new StringParameter(this, generateResourceId('parameter-userpool-id'), {
			parameterName: this.parameterNameUserPoolId,
			stringValue: userPool.userPoolId,
		});

		this.parameterNameUserPoolClient = `/${stage}/userpool-client`;
		new StringParameter(this, generateResourceId('parameter-userpool-client'), {
			parameterName: this.parameterNameUserPoolClient,
			stringValue: userPoolClient.userPoolClientId,
		});
	}
}
