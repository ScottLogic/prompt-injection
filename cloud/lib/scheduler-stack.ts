import { ApplicationLoadBalancedFargateService } from 'aws-cdk-lib/aws-ecs-patterns';
import {
	Effect,
	PolicyStatement,
	Role,
	ServicePrincipal,
} from 'aws-cdk-lib/aws-iam';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import {
	CronOptionsWithTimezone,
	Group,
	Schedule,
	ScheduleExpression,
	ScheduleTargetInput,
} from '@aws-cdk/aws-scheduler-alpha';
import { LambdaInvoke } from '@aws-cdk/aws-scheduler-targets-alpha';
import { RemovalPolicy, Stack, StackProps, TimeZone } from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import { join } from 'node:path';

import { ServiceEventLambda } from './lambdas/startStopService';
import { resourceDescription, resourceName } from './resourceNamingUtils';

type SchedulerStackProps = StackProps & {
	fargateService: ApplicationLoadBalancedFargateService;
};

export class SchedulerStack extends Stack {
	constructor(scope: Construct, id: string, props: SchedulerStackProps) {
		super(scope, id, props);

		const { fargateService } = props;
		const generateResourceName = resourceName(scope);
		const generateResourceDescription = resourceDescription(scope);

		// Lambda to bring fargate service up and down
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
				entry: join(__dirname, 'lambdas/startStopService.ts'),
				bundling: {
					minify: true,
				},
				environment: {
					CLUSTER_NAME: fargateService.cluster.clusterName,
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
				hour: '8',
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
				hour: '18',
			}),
		});
	}
}
