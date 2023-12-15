import {
	UserPool,
	UserPoolClient,
	UserPoolDomain,
} from 'aws-cdk-lib/aws-cognito';
import { Vpc } from 'aws-cdk-lib/aws-ec2';
import { DockerImageAsset } from 'aws-cdk-lib/aws-ecr-assets';
import {
	Cluster,
	ContainerImage,
	Secret as EnvSecret,
} from 'aws-cdk-lib/aws-ecs';
import { ApplicationLoadBalancedFargateService } from 'aws-cdk-lib/aws-ecs-patterns';
//import { ListenerAction } from 'aws-cdk-lib/aws-elasticloadbalancingv2';
//import { AuthenticateCognitoAction } from 'aws-cdk-lib/aws-elasticloadbalancingv2-actions';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';
import { Stack, StackProps } from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import { join } from 'node:path';

import { resourceName } from './resourceNamingUtils';

type ApiStackProps = StackProps & {
	userPool: UserPool;
	userPoolClient: UserPoolClient;
	userPoolDomain: UserPoolDomain;
};

export class ApiStack extends Stack {
	constructor(scope: Construct, id: string, props: ApiStackProps) {
		super(scope, id, props);
		//const { userPool, userPoolClient, userPoolDomain } = props;

		const generateResourceName = resourceName(scope);

		const dockerImageAsset = new DockerImageAsset(
			this,
			generateResourceName('container-image'),
			{
				directory: join(__dirname, '../../backend/'),
			}
		);

		// Default AZs is all in region, but for environment-agnostic stack, max is 2!
		const vpcName = generateResourceName('vpc');
		const vpc = new Vpc(this, vpcName, { vpcName, maxAzs: 2 });
		const clusterName = generateResourceName('cluster');
		const cluster = new Cluster(this, clusterName, { clusterName, vpc });

		const apiKeySecret = Secret.fromSecretNameV2(
			this,
			generateResourceName('apiKey'),
			'dev/SpyLogic/ApiKey'
		);

		// Create a load-balanced Fargate service and make it public
		const containerPort = 3001;
		const serviceName = generateResourceName('fargate');
		const loadBalancerName = generateResourceName('alb');
		const fargateService = new ApplicationLoadBalancedFargateService(
			this,
			serviceName,
			{
				serviceName,
				cluster,
				cpu: 256, // Default is 256
				desiredCount: 1, // Bump this up for prod!
				taskImageOptions: {
					image: ContainerImage.fromDockerImageAsset(dockerImageAsset),
					containerPort,
					environment: {
						NODE_ENV: 'development',
						PORT: `${containerPort}`,
					},
					secrets: {
						OPENAI_API_KEY: EnvSecret.fromSecretsManager(
							apiKeySecret,
							'OPENAI_API_KEY'
						),
						SESSION_SECRET: EnvSecret.fromSecretsManager(
							apiKeySecret,
							'SESSION_SECRET'
						),
					},
				},
				memoryLimitMiB: 512, // Default is 512
				loadBalancerName,
				publicLoadBalancer: true, // Default is true
			}
		);

		// Hook up Cognito to load balancer
		// https://stackoverflow.com/q/71124324
		// TODO This needs HTTPS and a Route53 domain, so in meantime try VPCLink:
		// https://repost.aws/knowledge-center/api-gateway-alb-integration
		/*
		const authActionName = generateResourceName('alb-auth');
		fargateService.listener.addAction(authActionName, {
			action: new AuthenticateCognitoAction({
				userPool,
				userPoolClient,
				userPoolDomain,
				next: ListenerAction.forward([fargateService.targetGroup]),
			}),
		});
		*/

		fargateService.targetGroup.configureHealthCheck({ path: '/openai/model' });
	}
}
