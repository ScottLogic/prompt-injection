import { BuildEnvironmentVariableType, BuildSpec } from 'aws-cdk-lib/aws-codebuild';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { IBucket } from 'aws-cdk-lib/aws-s3';
import { Stack, StackProps } from 'aws-cdk-lib/core';
import {
	CodeBuildStep,
	CodePipeline,
	CodePipelineSource,
	ShellStep,
	Step,
} from 'aws-cdk-lib/pipelines';
import { Construct } from 'constructs';

import { AppStage } from './app-stage';
import { DeployS3Step } from './constructs/DeployS3Step';
import { resourceId, stageName } from './resourceNamingUtils';

type PipelineStackProps = StackProps & {
	usEast1Bucket: IBucket;
};

export class PipelineStack extends Stack {
	constructor(scope: Construct, id: string, props: PipelineStackProps) {
		super(scope, id, props);

		const { env, tags, usEast1Bucket } = props;
		if (!env?.account || !env.region) {
			throw new Error('AWS Environment (account/region) not defined, cannot continue');
		}

		const generateResourceId = resourceId(scope);
		const stage = stageName(scope);

		// FIXME Reset branch to 'main' !!!
		const sourceCode = CodePipelineSource.connection(
			'ScottLogic/prompt-injection',
			'feature/aws-cloud-infrastructure',
			{
				//connectionArn: `arn:aws:codestar-connections:${env.region}:${env.account}:connection/05c0f0a4-2233-4269-a697-33a339f8a6bc`,
				connectionArn: `arn:aws:codestar-connections:eu-north-1:${env.account}:connection/05c0f0a4-2233-4269-a697-33a339f8a6bc`,
			}
		);

		const hostBucketName = generateResourceId('host-bucket');

		const identityProviderEnv =
			process.env.IDP_NAME?.toUpperCase() === 'AZURE'
				? {
						IDP_NAME: {
							type: BuildEnvironmentVariableType.PLAINTEXT,
							value: 'AZURE',
						},
						AZURE_APPLICATION_ID: {
							type: BuildEnvironmentVariableType.PARAMETER_STORE,
							value: 'AZURE_APPLICATION_ID',
						},
						AZURE_TENANT_ID: {
							type: BuildEnvironmentVariableType.PARAMETER_STORE,
							value: 'AZURE_TENANT_ID',
						},
					}
				: undefined;

		const pipeline = new CodePipeline(this, generateResourceId('pipeline'), {
			synth: new ShellStep('Synth', {
				input: sourceCode,
				installCommands: ['npm ci', 'cd cloud', 'npm ci --no-audit', 'cd ..'],
				// FIXME Revert this to `npm run cdk:synth -- --context STAGE=${stage}`
				commands: ['cd cloud', 'npm run cdk:dev:synth'],
				// FIXME Revert this to 'cloud/cdk.out'
				primaryOutputDirectory: 'cloud/cdk.dev.out',
			}),
			synthCodeBuildDefaults: {
				buildEnvironment: {
					environmentVariables: {
						DOMAIN_NAME: {
							type: BuildEnvironmentVariableType.PARAMETER_STORE,
							value: 'DOMAIN_NAME',
						},
						HOSTED_ZONE_ID: {
							type: BuildEnvironmentVariableType.PARAMETER_STORE,
							value: 'HOSTED_ZONE_ID',
						},
						...identityProviderEnv,
					},
				},
			},
			crossRegionReplicationBuckets: {
				'us-east-1': usEast1Bucket,
			},
		});

		const appStage = new AppStage(this, `${stage}-stage`, { env, tags, hostBucketName });
		const deployment = pipeline.addStage(appStage);

		// Pre-deployment quality checks
		deployment.addPre(
			// TODO Add a ConfirmPermissionsBroadening step:
			// new ConfirmPermissionsBroadening('Check Permissions', { stage: appStage }),
			new CodeBuildStep('API-CodeChecks', {
				input: sourceCode,
				commands: [
					'cd backend',
					'npm ci --no-audit',
					'npm run build',
					'npm run codecheck',
					'npm test',
				],
				env: {
					CI: 'true',
				},
				partialBuildSpec: BuildSpec.fromObject({
					reports: {
						jest: {
							files: 'backend/reports/*.xml',
							'file-format': 'JUNITXML',
						},
					},
				}),
			}),
			new CodeBuildStep('UI-CodeChecks', {
				input: sourceCode,
				commands: ['cd frontend', 'npm ci --no-audit', 'npm run codecheck', 'npm test'],
				partialBuildSpec: BuildSpec.fromObject({
					reports: {
						vitest: {
							files: 'frontend/reports/*.xml',
							'file-format': 'JUNITXML',
						},
					},
				}),
			})
		);

		// Post-deployment UI upload
		const uiBuildStep = new CodeBuildStep('UI-Build', {
			input: sourceCode,
			commands: ['cd frontend', 'npm ci --no-audit', 'npm run build'],
			primaryOutputDirectory: 'frontend/dist',
			env: {
				CI: 'true',
				VITE_AUTH_PROVIDER: 'cognito',
				VITE_COGNITO_IDP: identityProviderEnv?.IDP_NAME.value,
			} as Record<string, string>,
			envFromCfnOutputs: {
				VITE_UI_DOMAIN: appStage.domainName,
				VITE_BACKEND_URL: appStage.backendUrl,
				VITE_COGNITO_REDIRECT_URL: appStage.redirectUrl,
				VITE_COGNITO_USERPOOL_ID: appStage.userpoolId,
				VITE_COGNITO_USERPOOL_CLIENT: appStage.userpoolClient,
				VITE_COGNITO_USERPOOL_DOMAIN: appStage.userpoolDomain,
			},
		});

		deployment.addPost(
			...Step.sequence([
				uiBuildStep,
				new DeployS3Step('UI-Deploy', {
					actionName: 'UI-Deploy',
					bucketName: hostBucketName,
					// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
					input: uiBuildStep.primaryOutput!,
				}),
				new CodeBuildStep('CF-Invalidation', {
					commands: [
						'aws cloudfront create-invalidation --distribution-id $CF_DISTRIBUTION_ID --paths "/*"',
					],
					envFromCfnOutputs: {
						CF_DISTRIBUTION_ID: appStage.cloudFrontDistributionId,
					},
					rolePolicyStatements: [
						new PolicyStatement({
							actions: ['cloudfront:CreateInvalidation'],
							resources: [`arn:aws:cloudfront::${env.account}:distribution/*`],
						}),
					],
				}),
			])
		);
	}
}
