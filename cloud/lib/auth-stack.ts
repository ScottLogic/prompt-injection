import {
	Mfa,
	OAuthScope,
	ProviderAttribute,
	UserPool,
	UserPoolClient,
	UserPoolClientIdentityProvider,
	UserPoolDomain,
	UserPoolIdentityProviderSaml,
	UserPoolIdentityProviderSamlMetadata,
} from 'aws-cdk-lib/aws-cognito';
import { CfnOutput, Duration, Stack, StackProps, Tags } from 'aws-cdk-lib/core';
import { Construct } from 'constructs';

import { resourceName } from './resourceNamingUtils';

type AuthStackProps = StackProps & {
	webappUrl: string;
};

export class AuthStack extends Stack {
	userPool: UserPool;
	userPoolClient: UserPoolClient;
	userPoolDomain: UserPoolDomain;

	constructor(scope: Construct, id: string, props: AuthStackProps) {
		super(scope, id, props);

		const azureTenantId = process.env.AZURE_TENANT_ID;
		const azureApplicationId = process.env.AZURE_APPLICATION_ID;
		if (!azureTenantId || !azureApplicationId) {
			throw new Error(
				'Need AZURE_TENANT_ID and AZURE_APPLICATION_ID environment vars!'
			);
		}

		const generateResourceName = resourceName(scope);

		// Cognito UserPool
		const userPoolName = generateResourceName('userpool');
		this.userPool = new UserPool(this, userPoolName, {
			userPoolName,
			enableSmsRole: false,
			mfa: Mfa.OFF,
			//email // not configured, we're not going to send email from here
			signInCaseSensitive: false,
			autoVerify: { email: false }, // will be sending email invite anyway
			selfSignUpEnabled: false, // only users we explicity allow
			standardAttributes: {
				givenName: { required: true },
				familyName: { required: true },
				email: { required: true },
			},
			signInAliases: { email: true },
			deletionProtection: false,
		});
		// Tags not correctly assigned from parent stack: https://github.com/aws/aws-cdk/issues/14127
		Object.entries(props.tags ?? {}).forEach(([key, value]) => {
			Tags.of(this.userPool).add(key, value);
		});

		new CfnOutput(this, 'UserPool.Identifier', {
			value: `urn:amazon:cognito:sp:${this.userPool.userPoolId}`,
		});
		new CfnOutput(this, 'UserPool.ReplyUrl', {
			value: `https://${userPoolName}.auth.${this.region}.amazoncognito.com/saml2/idpresponse`,
		});

		const idpName = generateResourceName('userpool-idp');
		const identityProvider = new UserPoolIdentityProviderSaml(this, idpName, {
			name: idpName,
			idpSignout: true,
			metadata: UserPoolIdentityProviderSamlMetadata.url(
				`https://login.microsoftonline.com/${azureTenantId}/federationmetadata/2007-06/federationmetadata.xml?appid=${azureApplicationId}`
			),
			userPool: this.userPool,
			attributeMapping: {
				email: ProviderAttribute.other(
					'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'
				),
				familyName: ProviderAttribute.other(
					'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname'
				),
				givenName: ProviderAttribute.other(
					'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname'
				),
			},
		});

		const callbackUrls = [`${props.webappUrl}/`];
		const userPoolClientName = generateResourceName('userpool-client');
		this.userPoolClient = this.userPool.addClient(userPoolClientName, {
			userPoolClientName,
			authFlows: {
				userSrp: true,
			},
			supportedIdentityProviders: [
				UserPoolClientIdentityProvider.custom(identityProvider.providerName),
			],
			generateSecret: true,
			oAuth: {
				flows: {
					authorizationCodeGrant: true,
				},
				scopes: [OAuthScope.OPENID, OAuthScope.EMAIL, OAuthScope.PROFILE],
				callbackUrls,
				logoutUrls: callbackUrls,
			},
			accessTokenValidity: Duration.minutes(60),
			idTokenValidity: Duration.minutes(60),
			refreshTokenValidity: Duration.days(30),
			authSessionValidity: Duration.minutes(3),
			enableTokenRevocation: true,
			preventUserExistenceErrors: true,
		});

		const userPoolDomainName = generateResourceName('userpool-domain');
		this.userPoolDomain = this.userPool.addDomain(userPoolDomainName, {
			cognitoDomain: {
				domainPrefix: userPoolName,
			},
		});
	}
}
