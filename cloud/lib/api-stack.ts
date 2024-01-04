import { CfnStage, HttpApi, VpcLink } from 'aws-cdk-lib/aws-apigatewayv2';
import { HttpAlbIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import { UserPool, UserPoolClient, UserPoolDomain, } from 'aws-cdk-lib/aws-cognito';
import { Vpc } from 'aws-cdk-lib/aws-ec2';
import { DockerImageAsset } from 'aws-cdk-lib/aws-ecr-assets';
import { Cluster, ContainerImage, PropagatedTagSource, Secret as EnvSecret, } from 'aws-cdk-lib/aws-ecs';
import { ApplicationLoadBalancedFargateService } from 'aws-cdk-lib/aws-ecs-patterns';
//import { ListenerAction } from 'aws-cdk-lib/aws-elasticloadbalancingv2';
//import { AuthenticateCognitoAction } from 'aws-cdk-lib/aws-elasticloadbalancingv2-actions';
import { ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { LogGroup } from 'aws-cdk-lib/aws-logs';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';
import { CfnOutput, Stack, StackProps, Tags } from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import { join } from 'node:path';

import { resourceDescription, resourceName } from './resourceNamingUtils';

type ApiStackProps = StackProps & {
	userPool: UserPool;
	userPoolClient: UserPoolClient;
	userPoolDomain: UserPoolDomain;
	webappUrl: string;
};

export class ApiStack extends Stack {
	//public readonly loadBalancerUrl: string;

	constructor(scope: Construct, id: string, props: ApiStackProps) {
		super(scope, id, props);
		// TODO Enable cognito auth on APIGateway
		const { /*userPool, userPoolClient, userPoolDomain,*/ webappUrl } = props;

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
		const loadBalancerLogName = generateResourceName('loadbalancer-logs');
		const fargateService = new ApplicationLoadBalancedFargateService(
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
				loadBalancerName,
				publicLoadBalancer: false,
				propagateTags: PropagatedTagSource.SERVICE,
			}
		);
		fargateService.targetGroup.configureHealthCheck({
			path: '/health',
		});
		fargateService.loadBalancer.logAccessLogs(
			new Bucket(this, loadBalancerLogName, { bucketName: loadBalancerLogName })
		);
		//this.loadBalancerUrl = `http://${fargateService.loadBalancer.loadBalancerDnsName}`;

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

		// Create an HTTP APIGateway with a VPCLink integrated with our load balancer
		const vpcLinkName = generateResourceName('vpclink');
		const vpcLink = new VpcLink(this, vpcLinkName, {
			vpc,
			vpcLinkName,
		});
		Object.entries(props.tags ?? {}).forEach(([key, value]) => {
			Tags.of(vpcLink).add(key, value);
		});

		const apiName = generateResourceName('api');
		const api = new HttpApi(this, apiName, {
			apiName,
			description: generateResourceDescription('API'),
			corsPreflight: {
				allowHeaders: ['X-Forwarded-For', 'Content-Type', 'Authorization'],
				allowOrigins: [webappUrl],
			},
		});
		api.addRoutes({
			path: '/{proxy+}',
			integration: new HttpAlbIntegration(
				generateResourceName('api-integration'),
				fargateService.loadBalancer.listeners[0],
				{ vpcLink },
			),
		});

		// Logging not yet available in V2 API, so use CFN escape hatches.
		const apiLogGroup = new LogGroup(this, generateResourceName('api-logs'), { retention: 1 });
		apiLogGroup.grantWrite(new ServicePrincipal('apigateway.amazonaws.com'));
		(api.defaultStage!.node.defaultChild as CfnStage).accessLogSettings = {
			destinationArn: apiLogGroup.logGroupArn,
			format: JSON.stringify({
				requestId: '$context.requestId',
				sourceIp: '$context.identity.sourceIp',
				requestTime: '$context.requestTime',
				httpMethod: '$context.httpMethod',
				path: '$context.path',
				status: '$context.status',
				responseLength: '$context.responseLength',
			}),
		};

		new CfnOutput(this, 'APIGatewayURL', {
			value: api.defaultStage!.url,
		});
	}
}
