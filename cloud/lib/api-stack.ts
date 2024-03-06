import { CorsHttpMethod, HttpApi, VpcLink } from 'aws-cdk-lib/aws-apigatewayv2';
import { HttpAlbIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import { ICertificate } from 'aws-cdk-lib/aws-certificatemanager';
//import { UserPool, UserPoolClient, UserPoolDomain } from 'aws-cdk-lib/aws-cognito';
import { Port, SecurityGroup, Vpc } from 'aws-cdk-lib/aws-ec2';
import { DockerImageAsset } from 'aws-cdk-lib/aws-ecr-assets';
import {
	Cluster,
	ContainerImage,
	PropagatedTagSource,
	Secret as EnvSecret,
} from 'aws-cdk-lib/aws-ecs';
import { ApplicationLoadBalancedFargateService } from 'aws-cdk-lib/aws-ecs-patterns';
//import { ListenerAction, ListenerCondition } from 'aws-cdk-lib/aws-elasticloadbalancingv2';
//import { AuthenticateCognitoAction } from 'aws-cdk-lib/aws-elasticloadbalancingv2-actions';
import {
	Effect,
	PolicyStatement,
	Role,
	ServicePrincipal,
} from 'aws-cdk-lib/aws-iam';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { ARecord, IHostedZone, RecordTarget } from 'aws-cdk-lib/aws-route53';
import { LoadBalancerTarget } from 'aws-cdk-lib/aws-route53-targets';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import {
	CronOptionsWithTimezone,
	Group,
	Schedule,
	ScheduleExpression,
	ScheduleTargetInput,
} from '@aws-cdk/aws-scheduler-alpha';
import { LambdaInvoke } from '@aws-cdk/aws-scheduler-targets-alpha';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';
import {
	CfnOutput,
	RemovalPolicy,
	Stack,
	StackProps,
	Tags,
	TimeZone,
} from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import { join } from 'node:path';

import {
	appName,
	resourceDescription,
	resourceName,
} from './resourceNamingUtils';
import type { ServiceEventLambda } from './startStopServiceLambda';

type ApiStackProps = StackProps & {
	// userPool: UserPool;
	// userPoolClient: UserPoolClient;
	// userPoolDomain: UserPoolDomain;
	certificate: ICertificate;
	hostedZone: IHostedZone;
	webappUrl: string;
};

export class ApiStack extends Stack {
	constructor(scope: Construct, id: string, props: ApiStackProps) {
		super(scope, id, props);
		// TODO Enable cognito/JWT authorization
		const { certificate, hostedZone, webappUrl } = props;
		const domainName = `api.${hostedZone.zoneName}`;

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
				cpu: 256, // Default is 256
				desiredCount: 1, // Bump this up for prod!
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
				memoryLimitMiB: 512, // Default is 512
				loadBalancerName,
				openListener: false,
				publicLoadBalancer: false,
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

		// DNS A Record for Route53
		const loadBalancerARecordName = generateResourceName('arecord-alb');
		new ARecord(this, loadBalancerARecordName, {
			zone: hostedZone,
			target: RecordTarget.fromAlias(new LoadBalancerTarget(fargateService.loadBalancer)),
			deleteExisting: true,
			recordName: domainName,
			comment: 'DNS A Record for the load-balanced API',
		});

		// Lambda to bring fargate service up or down
		const startStopFunctionName = generateResourceName('fargate-switch');
		const startStopServiceFunction = new NodejsFunction(
			this,
			startStopFunctionName,
			{
				functionName: startStopFunctionName,
				description: generateResourceDescription(
					'Fargate Service start/stop function'
				),
				runtime: Runtime.NODEJS_18_X,
				handler: 'handler',
				entry: join(__dirname, './startStopServiceLambda.ts'),
				bundling: {
					minify: true,
				},
				environment: {
					CLUSTER_NAME: cluster.clusterName,
					SERVICE_NAME: fargateService.service.serviceName,
				},
			}
		);
		startStopServiceFunction.addToRolePolicy(
			new PolicyStatement({
				effect: Effect.ALLOW,
				actions: ['ecs:DescribeServices', 'ecs:UpdateService'],
				resources: [fargateService.service.serviceArn],
			})
		);

		// Schedule fargate service up at start of day, down at end
		const schedulerRoleName = generateResourceName('scheduler-role');
		const schedulerRole = new Role(this, schedulerRoleName, {
			roleName: schedulerRoleName,
			assumedBy: new ServicePrincipal('scheduler.amazonaws.com'),
		});
		const lambdaTarget = (operation: ServiceEventLambda['operation']) =>
			new LambdaInvoke(startStopServiceFunction, {
				input: ScheduleTargetInput.fromObject({ operation }),
				role: schedulerRole,
			});
		const cronDef: CronOptionsWithTimezone = {
			weekDay: 'MON-FRI',
			minute: '0',
			timeZone: TimeZone.EUROPE_LONDON,
		};
		const scheduleGroupName = generateResourceName('fargate-scheduler-group');
		const scheduleGroup = new Group(this, scheduleGroupName, {
			groupName: scheduleGroupName,
			removalPolicy: RemovalPolicy.DESTROY,
		});
		const serverUpScheduleName = generateResourceName('server-up');
		new Schedule(this, serverUpScheduleName, {
			scheduleName: serverUpScheduleName,
			description: generateResourceDescription('Scheduled server-up event'),
			target: lambdaTarget('start'),
			group: scheduleGroup,
			schedule: ScheduleExpression.cron({
				...cronDef,
				hour: '9',
			}),
		});
		const serverDownScheduleName = generateResourceName('server-down');
		new Schedule(this, serverDownScheduleName, {
			scheduleName: serverDownScheduleName,
			description: generateResourceDescription('Scheduled server-down event'),
			target: lambdaTarget('stop'),
			group: scheduleGroup,
			schedule: ScheduleExpression.cron({
				...cronDef,
				hour: '17',
			}),
		});

		// TODO Hook up Cognito to load balancer, then remove API Gateway shenanigans
		// https://stackoverflow.com/q/71124324
		/*
		const authActionName = generateResourceName('alb-auth');
		fargateService.listener.addAction(authActionName, {
			action: new AuthenticateCognitoAction({
				userPool,
				userPoolClient,
				userPoolDomain,
				next: ListenerAction.forward([fargateService.targetGroup]),
			}),
			conditions: [ListenerCondition.hostHeaders([domainName])],
		});
		*/

		// Create an HTTP APIGateway with a VPCLink integrated with our load balancer
		const securityGroupName = generateResourceName('vpclink-sg');
		const vpcLinkSecurityGroup = new SecurityGroup(this, securityGroupName, {
			vpc,
			securityGroupName,
			allowAllOutbound: false,
		});
		vpcLinkSecurityGroup.connections.allowFromAnyIpv4(
			Port.tcp(80),
			'APIGW to VPCLink'
		);
		vpcLinkSecurityGroup.connections.allowTo(
			fargateService.loadBalancer,
			Port.tcp(80),
			'VPCLink to ALB'
		);

		const vpcLinkName = generateResourceName('vpclink');
		const vpcLink = new VpcLink(this, vpcLinkName, {
			vpc,
			vpcLinkName,
			securityGroups: [vpcLinkSecurityGroup],
		});
		Object.entries(props.tags ?? {}).forEach(([key, value]) => {
			Tags.of(vpcLink).add(key, value);
		});

		const apiName = generateResourceName('api');
		const api = new HttpApi(this, apiName, {
			apiName,
			description: generateResourceDescription('API'),
			corsPreflight: {
				allowOrigins: [webappUrl],
				allowMethods: [CorsHttpMethod.ANY],
				allowHeaders: ['Content-Type', 'Authorization'],
				allowCredentials: true,
			},
		});
		api.addRoutes({
			path: '/{proxy+}',
			integration: new HttpAlbIntegration(
				generateResourceName('api-integration'),
				fargateService.loadBalancer.listeners[0],
				{ vpcLink }
			),
		});

		new CfnOutput(this, 'APIGatewayURL', {
			value:
				api.defaultStage?.url ??
				'FATAL ERROR: Gateway does not have a default stage',
		});
	}
}
