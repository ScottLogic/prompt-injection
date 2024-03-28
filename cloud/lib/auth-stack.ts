import {
	Mfa,
	OAuthScope,
	UserPool,
	UserPoolClient,
} from 'aws-cdk-lib/aws-cognito';
import { IHostedZone } from 'aws-cdk-lib/aws-route53';
import { CfnOutput, Duration, RemovalPolicy, Stack, StackProps, Tags, } from 'aws-cdk-lib/core';
import { Construct } from 'constructs';

import { resourceId } from './resourceNamingUtils';

type AuthStackProps = StackProps & {
	hostedZone: IHostedZone;
};

export class AuthStack extends Stack {
	// TODO Need these in our auth edge lambda! Can we use ParameterStore?
	public readonly userPool: UserPool;
	public readonly userPoolClient: UserPoolClient;

	constructor(scope: Construct, id: string, props: AuthStackProps) {
		super(scope, id, props);

		const generateResourceId = resourceId(scope);
		const { hostedZone } = props;

		// Cognito UserPool
		this.userPool = new UserPool(this, generateResourceId('userpool'), {
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
			Tags.of(this.userPool).add(key, value);
		});

		new CfnOutput(this, 'UserPool.Id', {
			value: `urn:amazon:cognito:sp:${this.userPool.userPoolId}`,
		});

		const logoutUrls = [`https://${hostedZone.zoneName}`];
		const callbackUrls = logoutUrls.concat(
			`https://api.${hostedZone.zoneName}/oauth2/idpresponse`
		);
		this.userPoolClient = this.userPool.addClient(
			generateResourceId('userpool-client'),
			{
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
			}
		);

		new CfnOutput(this, 'UserPoolClient.Id', {
			value: this.userPoolClient.userPoolClientId,
		});

		this.userPool.addDomain(generateResourceId('userpool-domain'), {
			cognitoDomain: {
				domainPrefix: generateResourceId('auth'),
			},
		});
	}
}
