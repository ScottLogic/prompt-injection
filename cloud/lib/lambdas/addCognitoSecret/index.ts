import {
	GetSecretValueCommand,
	GetSecretValueCommandOutput,
	SecretsManagerClient
} from '@aws-sdk/client-secrets-manager';
import type { CloudFrontRequestEvent, CloudFrontResponse } from 'aws-lambda';
import { createHmac } from 'node:crypto';

type InitiateAuthBody = {
	AuthFlow: 'USER_SRP_AUTH';
	AuthParameters: {
		USERNAME: string;
		SRP_A: string;
		SECRET_HASH: string;
	};
	ClientId: string;
};
type RespondToAuthChallengeBody = {
	ChallengeName: 'PASSWORD_VERIFIER';
	ChallengeResponses: {
		USERNAME: string;
		SECRET_HASH: string;
	};
	ClientId: string;
};

// Unfortunately need to hard-code this, as Edge functions cannot access env vars.
// TODO Can we use parcel to create a bundle with included env vars?
// TODO Change this to prod stage!!
const SecretId = 'dev/SpyLogic/CognitoSecret';
const domainName = 'spylogic.ai';

const retrieveSecret = (() => {
	let secretPromise: Promise<GetSecretValueCommandOutput> | undefined = undefined;
	return async () => {
		if (!secretPromise) {
			secretPromise = new SecretsManagerClient({
				region: 'eu-north-1',
			}).send(
				new GetSecretValueCommand({ SecretId })
			);
		}
		return (await secretPromise).SecretString;
	};
})();

type GenerateHashParams = {
	clientId: string;
	clientSecret: string;
	username: string;
};
const generateSecretHash = ({ clientId, clientSecret, username }: GenerateHashParams) =>
	createHmac('SHA256', clientSecret)
		.update(username + clientId)
		.digest('base64');

export const handler = async (event: CloudFrontRequestEvent) => {
	const request = event.Records[0].cf.request;

	// Annoyingly, must add CORS headers manually here, and
	// they must be in this funky lowercase/uppercase/key-value format :(
	if (request.method === 'OPTIONS') {
		return {
			status: '200',
			statusDescription: 'OK',
			headers: {
				'access-control-allow-origin': [{
					key: 'Access-Control-Allow-Origin',
					value: `https://${domainName}`,
				}],
				'access-control-allow-methods': [{
					key: 'Access-Control-Allow-Methods',
					value: 'POST',
				}],
				'access-control-allow-headers': [{
					key: 'Access-Control-Allow-Headers',
					value: 'cache-control,content-type,x-amz-target,x-amz-user-agent',
				}],
			}
		} as CloudFrontResponse;
	}

	// Read from secrets manager, as Edge functions don't support env vars.
	const clientSecret = await retrieveSecret();
	if (!clientSecret) {
		console.error('Client secret not found in Secrets Manager');
		return request;
	}

	if (request.method === 'POST') {
		if (request.body) {
			const body = JSON.parse(
				Buffer.from(request.body.data, 'base64').toString()
			) as InitiateAuthBody | RespondToAuthChallengeBody;

			// Need to intercept initial auth request AND subsequent challenge
			let injectionPoint: { SECRET_HASH: string, USERNAME: string } | null = null;
			if ('AuthParameters' in body && body.AuthParameters.USERNAME) {
				injectionPoint = body.AuthParameters;
			} else if ('ChallengeResponses' in body && body.ChallengeResponses.USERNAME) {
				injectionPoint = body.ChallengeResponses;
			}

			if (injectionPoint) {
				injectionPoint.SECRET_HASH = generateSecretHash({
					clientId: body.ClientId,
					clientSecret,
					username: injectionPoint.USERNAME,
				});
				request.body = {
					action: 'replace',
					encoding: 'text',
					data: JSON.stringify(body),
					inputTruncated: false,
				};
			}
		} else {
			console.error(
				'Request body missing, did you omit "includeBody" from EdgeLambda definition?'
			);
		}
	}

	return request;
};
