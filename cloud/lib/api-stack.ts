import { ConnectionType, Integration, IntegrationType, RestApi, VpcLink } from 'aws-cdk-lib/aws-apigateway';
import { UserPool, UserPoolClient, UserPoolDomain, } from 'aws-cdk-lib/aws-cognito';
import { Vpc } from 'aws-cdk-lib/aws-ec2';
import { DockerImageAsset } from 'aws-cdk-lib/aws-ecr-assets';
import { Cluster, ContainerImage, PropagatedTagSource, Secret as EnvSecret, } from 'aws-cdk-lib/aws-ecs';
import { NetworkLoadBalancedFargateService } from 'aws-cdk-lib/aws-ecs-patterns';
//import { ListenerAction } from 'aws-cdk-lib/aws-elasticloadbalancingv2';
//import { AuthenticateCognitoAction } from 'aws-cdk-lib/aws-elasticloadbalancingv2-actions';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';
import { Stack, StackProps } from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import { join } from 'node:path';

import { resourceDescription, resourceName, stageName } from './resourceNamingUtils';
import { NetworkLoadBalancer } from 'aws-cdk-lib/aws-elasticloadbalancingv2';

type ApiStackProps = StackProps & {
	userPool: UserPool;
	userPoolClient: UserPoolClient;
	userPoolDomain: UserPoolDomain;
	webappUrl: string;
};

export class ApiStack extends Stack {
	public readonly loadBalancerUrl: string;

	constructor(scope: Construct, id: string, props: ApiStackProps) {
		super(scope, id, props);
		//const { userPool, userPoolClient, userPoolDomain } = props;
		const { webappUrl } = props;

		const generateResourceName = resourceName(scope);
		const generateResourceDescription = resourceDescription(scope);

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

		// Create a private, network-load-balanced Fargate service
		const containerPort = 3001;
		const fargateServiceName = generateResourceName('fargate');
		const loadBalancerName = generateResourceName('loadbalancer');
		const fargateService = new NetworkLoadBalancedFargateService(
			this,
			fargateServiceName,
			{
				serviceName: fargateServiceName,
				cluster,
				cpu: 256, // Default is 256
				desiredCount: 1, // Bump this up for prod!
				taskImageOptions: {
					image: ContainerImage.fromDockerImageAsset(dockerImageAsset),
					containerPort,
					environment: {
						NODE_ENV: 'development',
						PORT: `${containerPort}`,
						CORS_ALLOW_ORIGIN: webappUrl,
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
				loadBalancer: new NetworkLoadBalancer(this, loadBalancerName, {
					loadBalancerName,
					vpc,
					crossZoneEnabled: true,
				}),
				propagateTags: PropagatedTagSource.SERVICE,
			}
		);
		this.loadBalancerUrl = `http://${fargateService.loadBalancer.loadBalancerDnsName}`;

		// Hook up Cognito to load balancer
		// https://stackoverflow.com/q/71124324
		// TODO Needs HTTPS and a Route53 domain, so for now we're using APIGateway and VPCLink:
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

		// This is only for Application Load Balancer:
		//fargateService.targetGroup.configureHealthCheck({ path: '/health' });

		// Create an APIGateway with a VPCLink connected to our load balancer
		const vpcLinkName = generateResourceName('vpclink');
		const vpcLink = new VpcLink(this, vpcLinkName, {
			vpcLinkName,
			targets: [fargateService.loadBalancer],
		});
		const api = new RestApi(this, generateResourceName('api'), {
			description: generateResourceDescription('API'),
			deployOptions: {
				dataTraceEnabled: true, // TODO Disable this after testing
				tracingEnabled: true,
				stageName: stageName(scope),
			},
		});
		api.root.addProxy({
			defaultIntegration: new Integration({
				type: IntegrationType.HTTP_PROXY,
				integrationHttpMethod: 'ANY',
				options: {
					connectionType: ConnectionType.VPC_LINK,
					vpcLink,
				},
			}),
		}).addCorsPreflight({
			allowHeaders: ['X-Forwarded-For', 'Content-Type', 'Authorization'],
			allowOrigins: [webappUrl],
		});
	}
}
