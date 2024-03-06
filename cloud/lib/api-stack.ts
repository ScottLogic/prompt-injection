import { ICertificate } from 'aws-cdk-lib/aws-certificatemanager';
//import { UserPool, UserPoolClient, UserPoolDomain } from 'aws-cdk-lib/aws-cognito';
import {
	InstanceClass,
	InstanceSize,
	InstanceType,
	NatInstanceProvider,
	Vpc,
} from 'aws-cdk-lib/aws-ec2';
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
import { RemovalPolicy, Stack, StackProps, TimeZone } from 'aws-cdk-lib/core';
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
				cpu: 256, // Default is 256
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
				memoryLimitMiB: 512, // Default is 512
				loadBalancerName,
				openListener: false,
				publicLoadBalancer: true,
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
			target: RecordTarget.fromAlias(
				new LoadBalancerTarget(fargateService.loadBalancer)
			),
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
	}
}
