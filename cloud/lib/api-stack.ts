import { ICertificate } from 'aws-cdk-lib/aws-certificatemanager';
import {
	InstanceClass,
	InstanceSize,
	InstanceType,
	NatInstanceProviderV2,
	Vpc,
} from 'aws-cdk-lib/aws-ec2';
import { DockerImageAsset } from 'aws-cdk-lib/aws-ecr-assets';
import { Cluster, ContainerImage, PropagatedTagSource, Secret as EnvSecret, } from 'aws-cdk-lib/aws-ecs';
import { ApplicationLoadBalancedFargateService } from 'aws-cdk-lib/aws-ecs-patterns';
import { IHostedZone } from 'aws-cdk-lib/aws-route53';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';
import { RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import { join } from 'node:path';

import { appName, resourceId } from './resourceNamingUtils';

type ApiStackProps = StackProps & {
	certificate: ICertificate;
	hostedZone: IHostedZone;
};

export class ApiStack extends Stack {
	constructor(scope: Construct, id: string, props: ApiStackProps) {
		super(scope, id, props);

		const generateResourceId = resourceId(scope);

		const { certificate, env, hostedZone } = props;

		const domainName = `api.${hostedZone.zoneName}`;
		const region = env?.region;
		if (!region) {
			throw new Error('Region not defined in stack env, cannot continue!');
		}

		const dockerImageAsset = new DockerImageAsset(
			this,
			generateResourceId('container-image'),
			{
				directory: join(__dirname, '../../backend/'),
			}
		);

		// Default AZs is all in region, but for environment-agnostic stack, max is 2!
		const vpc = new Vpc(this, generateResourceId('vpc'), {
			maxAzs: 2,
			natGatewayProvider: NatInstanceProviderV2.instance({
				instanceType: InstanceType.of(InstanceClass.T3, InstanceSize.MICRO),
				//machineImage: MachineImage.latestAmazonLinux2({ cachedInContext: true }),
			}),
		});

		const apiKeySecret = Secret.fromSecretNameV2(
			this,
			generateResourceId('apikey'),
			'dev/SpyLogic/ApiKey'
		);

		// Create a private, application-load-balanced Fargate service
		const containerPort = 3001;
		const fargateService = new ApplicationLoadBalancedFargateService(
			this,
			generateResourceId('fargate'),
			{
				cluster: new Cluster(this, generateResourceId('cluster'), { vpc }),
				cpu: 256,
				desiredCount: 1,
				taskImageOptions: {
					image: ContainerImage.fromDockerImageAsset(dockerImageAsset),
					containerPort,
					environment: {
						NODE_ENV: 'production',
						PORT: `${containerPort}`,
						CORS_ALLOW_ORIGIN: `https://${hostedZone.zoneName}`,
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
			new Bucket(this, generateResourceId('loadbalancer-logs'), {
				autoDeleteObjects: true,
				removalPolicy: RemovalPolicy.DESTROY,
			})
		);

		// TODO
		// - Cloudfront distribution for API, non-caching
		// - Edge function on API distribution to verify access token from header (or cookie?),
		//   and if ok add X-Origin-Secret header (uuid) to request, else log and passthrough unchanged
		// - ALB listener rule redirects to target group only if X-Origin-Secret header present with expected value
		// - ALB *default* listener rule returns 403 Forbidden
		// - In UI code, make cognito/amplify auth opt-in via env flag
		/*
		const authEdgeFunction = new experimental.EdgeFunction(this, generateResourceId('api-gatekeeper'), {
			handler: 'index.handler',
			runtime: Runtime.NODEJS_18_X,
			code: Code.fromAsset(join(__dirname, 'lambdas/build/verifyAuthToken')),
		});
		*/
	}
}
