import {
	CronOptionsWithTimezone,
	Group,
	Schedule,
	ScheduleExpression,
	ScheduleTargetInput,
} from '@aws-cdk/aws-scheduler-alpha';
import { LambdaInvoke } from '@aws-cdk/aws-scheduler-targets-alpha';
import { FargateService } from 'aws-cdk-lib/aws-ecs';
import { Effect, PolicyStatement, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { RemovalPolicy, Stack, StackProps, TimeZone } from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import { join } from 'node:path';

import { ServiceEventLambda } from './lambdas/startStopService';
import { resourceDescription, resourceId } from './resourceNamingUtils';

type SchedulerStackProps = StackProps & {
	fargateService: FargateService;
};

export class SchedulerStack extends Stack {
	constructor(scope: Construct, id: string, props: SchedulerStackProps) {
		super(scope, id, props);

		const { fargateService } = props;
		const generateResourceId = resourceId(scope);
		const generateResourceDescription = resourceDescription(scope);

		// Lambda to bring fargate service up and down
		const startStopServiceFunction = new NodejsFunction(
			this,
			generateResourceId('fargate-switch'),
			{
				description: generateResourceDescription('Fargate Service start/stop function'),
				runtime: Runtime.NODEJS_18_X,
				handler: 'handler',
				entry: join(__dirname, 'lambdas/startStopService.ts'),
				bundling: {
					minify: true,
				},
				environment: {
					CLUSTER_NAME: fargateService.cluster.clusterName,
					SERVICE_NAME: fargateService.serviceName,
				},
			}
		);
		startStopServiceFunction.addToRolePolicy(
			new PolicyStatement({
				effect: Effect.ALLOW,
				actions: ['ecs:DescribeServices', 'ecs:UpdateService'],
				resources: [fargateService.serviceArn],
			})
		);

		// Schedule fargate service up at start of day, down at end
		const schedulerRole = new Role(this, generateResourceId('scheduler-role'), {
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

		const scheduleGroup = new Group(this, generateResourceId('fargate-scheduler-group'), {
			removalPolicy: RemovalPolicy.DESTROY,
		});

		new Schedule(this, generateResourceId('server-up'), {
			description: generateResourceDescription('Scheduled server-up event'),
			target: lambdaTarget('start'),
			group: scheduleGroup,
			schedule: ScheduleExpression.cron({
				...cronDef,
				hour: '8',
			}),
		});

		new Schedule(this, generateResourceId('server-down'), {
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
