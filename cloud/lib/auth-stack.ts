import {
	Mfa,
	OAuthScope,
	ProviderAttribute,
	UserPool,
	UserPoolClientIdentityProvider,
	UserPoolIdentityProviderSaml,
	UserPoolIdentityProviderSamlMetadata,
} from 'aws-cdk-lib/aws-cognito';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import { CfnOutput, Duration, RemovalPolicy, Stack, StackProps, Tags } from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import { randomUUID } from 'node:crypto';

import { appName, resourceId, stageName } from './resourceNamingUtils';

type AuthStackProps = StackProps & {
	domainName: string;
};

export class AuthStack extends Stack {
	public readonly customAuthHeaderName = 'X-Origin-Verified';
	public readonly customAuthHeaderValue: string;
	public readonly parameterNameUserPoolId: string;
	public readonly parameterNameUserPoolClient: string;
	public readonly userPoolId: CfnOutput;
	public readonly userPoolClient: CfnOutput;
	public readonly userPoolDomain: CfnOutput;

	constructor(scope: Construct, id: string, props: AuthStackProps) {
		super(scope, id, props);

		const stage = stageName(scope);
		const generateResourceId = resourceId(scope);

		const { domainName, env } = props;
		if (!env?.region) {
			throw new Error('Region not defined in stack env, cannot continue!');
		}

		// Regenerated each time we deploy the stacks:
		this.customAuthHeaderValue = randomUUID();

		/*
		User Pool - including attribute claims and password policy
		*/
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

		/*
		Identity Providers - currently only Cognito itself plus Azure
		*/
		const supportedIdentityProviders = [UserPoolClientIdentityProvider.COGNITO];

		if (process.env.IDP_NAME?.toUpperCase() === 'AZURE') {
			const { AZURE_APPLICATION_ID, AZURE_TENANT_ID } = process.env;
			if (!AZURE_APPLICATION_ID) throw new Error('Missing env var AZURE_APPLICATION_SECRET');
			if (!AZURE_TENANT_ID) throw new Error('Missing env var AZURE_TENANT_ID');
			const idp = new UserPoolIdentityProviderSaml(this, generateResourceId('azure-idp'), {
				name: 'AZURE',
				userPool,
				metadata: UserPoolIdentityProviderSamlMetadata.url(
					`https://login.microsoftonline.com/${AZURE_TENANT_ID}/federationmetadata/2007-06/federationmetadata.xml?appid=${AZURE_APPLICATION_ID}`
				),
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
			supportedIdentityProviders.push(UserPoolClientIdentityProvider.custom(idp.providerName));
		}

		/*
		User Pool Domain - where authentication service is reachable
		 */
		const userPoolDomain = userPool.addDomain(generateResourceId('userpool-domain'), {
			cognitoDomain: {
				domainPrefix:
					stage === 'prod' ? appName.toLowerCase() : `${stage}-${appName.toLowerCase()}`,
			},
		});

		/*
		User Pool Client - defines Auth flow and token validity
		*/
		const logoutUrls = [`https://${domainName}`];
		const replyUrl = `${userPoolDomain.baseUrl()}/saml2/idpresponse`;
		const userPoolClient = userPool.addClient(generateResourceId('userpool-client'), {
			authFlows: {
				userSrp: true,
			},
			oAuth: {
				flows: {
					authorizationCodeGrant: true,
				},
				scopes: [OAuthScope.OPENID, OAuthScope.EMAIL, OAuthScope.PROFILE],
				callbackUrls: logoutUrls.concat(replyUrl),
				logoutUrls,
			},
			supportedIdentityProviders,
			accessTokenValidity: Duration.minutes(60),
			idTokenValidity: Duration.minutes(60),
			refreshTokenValidity: Duration.days(14),
			enableTokenRevocation: true,
			preventUserExistenceErrors: true,
		});

		/*
		Stack outputs, used in pipeline
		*/
		this.userPoolId = new CfnOutput(this, 'UserPool.Id', {
			value: userPool.userPoolId,
		});
		this.userPoolClient = new CfnOutput(this, 'UserPool.Client', {
			value: userPoolClient.userPoolClientId,
		});
		this.userPoolDomain = new CfnOutput(this, 'UserPool.Domain', {
			value: userPoolDomain.baseUrl().replace('https://', ''),
		});

		new CfnOutput(this, 'UserPool.ReplyURL', {
			value: replyUrl,
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
