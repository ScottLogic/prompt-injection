import { ICertificate } from 'aws-cdk-lib/aws-certificatemanager';
import { UserPoolClient } from 'aws-cdk-lib/aws-cognito';
import { InstanceClass, InstanceSize, InstanceType, NatInstanceProvider, Vpc, } from 'aws-cdk-lib/aws-ec2';
import { DockerImageAsset } from 'aws-cdk-lib/aws-ecr-assets';
import { Cluster, ContainerImage, PropagatedTagSource, Secret as EnvSecret, } from 'aws-cdk-lib/aws-ecs';
import { ApplicationLoadBalancedFargateService } from 'aws-cdk-lib/aws-ecs-patterns';
import { ListenerAction, UnauthenticatedAction } from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { IHostedZone } from 'aws-cdk-lib/aws-route53';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';
import { RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import { join } from 'node:path';

import { appName, resourceName } from './resourceNamingUtils';

type ApiStackProps = StackProps & {
	userPoolId: string;
	userPoolName: string;
	userPoolClient: UserPoolClient;
	certificate: ICertificate;
	hostedZone: IHostedZone;
	webappUrl: string;
};

export class ApiStack extends Stack {
	constructor(scope: Construct, id: string, props: ApiStackProps) {
		super(scope, id, props);

		const generateResourceName = resourceName(scope);

		const {
			certificate,
			env,
			hostedZone,
			userPoolId,
			userPoolName,
			userPoolClient,
			webappUrl,
		} = props;

		const domainName = `api.${hostedZone.zoneName}`;
		const region = env?.region;
		if (!region) {
			throw new Error('Region not defined in stack env, cannot continue!');
		}

		const dockerImageAsset = new DockerImageAsset(
			this,
			generateResourceName('container-image'),
			{
				directory: join(__dirname, '../../backend/'),
			}
		);

		// Default AZs is all in region, but for environment-agnostic stack, max is 2!
		const vpcName = generateResourceName('vpc');
		const vpc = new Vpc(this, vpcName, {
			vpcName,
			maxAzs: 2,
			natGatewayProvider: NatInstanceProvider.instance({
				instanceType: InstanceType.of(InstanceClass.T3, InstanceSize.MICRO),
			}),
		});
		const clusterName = generateResourceName('cluster');
		const cluster = new Cluster(this, clusterName, { clusterName, vpc });

		const apiKeySecret = Secret.fromSecretNameV2(
			this,
			generateResourceName('apiKey'),
			'dev/SpyLogic/ApiKey'
		);

		// Create a private, application-load-balanced Fargate service
		const containerPort = 3001;
		const fargateServiceName = generateResourceName('fargate');
		const loadBalancerName = generateResourceName('loadbalancer');
		const loadBalancerLogName = generateResourceName('loadbalancer-logs');
		const fargateService = new ApplicationLoadBalancedFargateService(
			this,
			fargateServiceName,
			{
				serviceName: fargateServiceName,
				cluster,
				cpu: 256,
				desiredCount: 1,
				taskImageOptions: {
					image: ContainerImage.fromDockerImageAsset(dockerImageAsset),
					containerPort,
					environment: {
						NODE_ENV: 'production',
						PORT: `${containerPort}`,
						CORS_ALLOW_ORIGIN: webappUrl,
						COOKIE_NAME: `${appName}.sid`,
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
				memoryLimitMiB: 512,
				loadBalancerName,
				certificate,
				domainName,
				domainZone: hostedZone,
				propagateTags: PropagatedTagSource.SERVICE,
			}
		);
		fargateService.targetGroup.configureHealthCheck({
			path: '/health',
		});
		fargateService.loadBalancer.logAccessLogs(
			new Bucket(this, loadBalancerLogName, {
				bucketName: loadBalancerLogName,
				autoDeleteObjects: true,
				removalPolicy: RemovalPolicy.DESTROY,
			})
		);

		// Hook up Cognito to authenticate ALB
		// See https://docs.aws.amazon.com/elasticloadbalancing/latest/application/listener-authenticate-users.html
		// https://stackoverflow.com/a/67485343 - universal solution
		// https://stackoverflow.com/q/71124324 - only works for subset of regions
		const authActionName = generateResourceName('alb-auth');
		fargateService.loadBalancer.listeners[0].addAction(authActionName, {
			action: ListenerAction.authenticateOidc({
				issuer: `https://cognito-idp.${region}.amazonaws.com/${userPoolId}`,
				authorizationEndpoint: `https://${userPoolName}.auth.${region}.amazoncognito.com/oauth2/authorize`,
				clientId: userPoolClient.userPoolClientId,
				clientSecret: userPoolClient.userPoolClientSecret,
				tokenEndpoint: `https://${userPoolName}.auth.${region}.amazoncognito.com/oauth2/token`,
				userInfoEndpoint: `https://${userPoolName}.auth.${region}.amazoncognito.com/oauth2/userInfo`,
				onUnauthenticatedRequest: UnauthenticatedAction.DENY,
				//scope //TODO Is default "openid" enough, or do we need "email" also?
				next: ListenerAction.forward([fargateService.targetGroup]),
			}),
			//conditions: [ListenerCondition.hostHeaders([domainName])],
			//priority: 1000,
		});
	}
}
