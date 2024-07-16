import { ICertificate } from 'aws-cdk-lib/aws-certificatemanager';
import {
	InstanceClass,
	InstanceSize,
	InstanceType,
	LookupMachineImage,
	NatInstanceProviderV2,
	NatTrafficDirection,
	Peer,
	Port,
	Vpc,
} from 'aws-cdk-lib/aws-ec2';
import { DockerImageAsset } from 'aws-cdk-lib/aws-ecr-assets';
import {
	Cluster,
	Compatibility,
	ContainerImage,
	FargateService,
	PropagatedTagSource,
	Secret as EnvSecret,
	TaskDefinition,
} from 'aws-cdk-lib/aws-ecs';
import {
	ApplicationLoadBalancer,
	ApplicationProtocol,
	ListenerAction,
	ListenerCondition,
} from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { ARecord, IHostedZone, RecordTarget } from 'aws-cdk-lib/aws-route53';
import { LoadBalancerTarget } from 'aws-cdk-lib/aws-route53-targets';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';
import { RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import { join } from 'node:path';

import { appName, resourceId, stageName } from './resourceNamingUtils';

type ApiStackProps = StackProps & {
	apiDomainName: string;
	certificate: ICertificate;
	customAuthHeaderName: string;
	customAuthHeaderValue: string;
	hostedZone: IHostedZone;
};

export class ApiStack extends Stack {
	constructor(scope: Construct, id: string, props: ApiStackProps) {
		super(scope, id, props);

		const generateResourceId = resourceId(scope);
		const stage = stageName(scope);

		const {
			apiDomainName,
			certificate,
			customAuthHeaderName,
			customAuthHeaderValue,
			env,
			hostedZone,
		} = props;
		const region = env?.region;
		if (!region) {
			throw new Error('Region not defined in stack env, cannot continue!');
		}

		const dockerImageAsset = new DockerImageAsset(this, generateResourceId('container-image'), {
			directory: join(__dirname, '../../backend/'),
		});

		// TODO Look into IPv6 Routing, so no need for NAT Gateway or Instance!
		// https://www.turbogeek.co.uk/aws-cdk-ipv6-v/
		// https://docs.aws.amazon.com/vpc/latest/userguide/egress-only-internet-gateway.html

		// AMI courtesy of fck-nat: https://fck-nat.dev/stable/deploying/#cdk
		const natGatewayProvider = NatInstanceProviderV2.instanceV2({
			instanceType: InstanceType.of(InstanceClass.T3, InstanceSize.MICRO),
			machineImage: new LookupMachineImage({
				name: 'fck-nat-al2023-*-x86_64-ebs',
				owners: ['568608671756'],
			}),
			defaultAllowedTraffic: NatTrafficDirection.NONE,
		});

		const vpc = new Vpc(this, generateResourceId('vpc'), {
			maxAzs: 2,
			natGatewayProvider,
		});

		// Security Group rules for NAT instance: from container to internet
		natGatewayProvider.connections.allowToAnyIpv4(Port.HTTPS, 'Egress from NAT to internet');
		vpc.privateSubnets.forEach((subnet) => {
			natGatewayProvider.connections.allowFrom(
				Peer.ipv4(subnet.ipv4CidrBlock),
				Port.HTTPS,
				`Ingress from private subnet ${subnet.subnetId} to NAT`
			);
		});

		const apiKeySecret = Secret.fromSecretNameV2(
			this,
			generateResourceId('apikey'),
			`${stage}/SpyLogic/ApiKey`
		);

		/*
		Fargate service defines task running our backend container.
			Note: cannot use ApplicationLoadBalancedFargateService construct as that adds a
			public listener we do not want - we provide our own listener with custom rules.
		*/
		const containerPort = 3001;
		const fargateService = new FargateService(this, generateResourceId('service'), {
			cluster: new Cluster(this, generateResourceId('cluster'), { vpc }),
			desiredCount: 1,
			propagateTags: PropagatedTagSource.SERVICE,
			taskDefinition: new TaskDefinition(this, generateResourceId('service-task'), {
				cpu: '256',
				memoryMiB: '512',
				compatibility: Compatibility.FARGATE,
			}),
		});
		fargateService.taskDefinition.addContainer(generateResourceId('service-container'), {
			image: ContainerImage.fromDockerImageAsset(dockerImageAsset),
			portMappings: [{ containerPort }],
			environment: {
				NODE_ENV: 'production',
				PORT: `${containerPort}`,
				CORS_ALLOW_ORIGIN: `https://${hostedZone.zoneName}`,
				COOKIE_NAME: `${appName}.sid`,
			},
			secrets: {
				OPENAI_API_KEY: EnvSecret.fromSecretsManager(apiKeySecret, 'OPENAI_API_KEY'),
				SESSION_SECRET: EnvSecret.fromSecretsManager(apiKeySecret, 'SESSION_SECRET'),
			},
		});

		/*
		Public-facing load balancer
		*/
		const loadBalancer = new ApplicationLoadBalancer(this, generateResourceId('lb'), {
			vpc,
			internetFacing: true,
		});
		loadBalancer.logAccessLogs(
			new Bucket(this, generateResourceId('lb-logs'), {
				autoDeleteObjects: true,
				removalPolicy: RemovalPolicy.DESTROY,
			})
		);

		/*
		Listener for load balancer
			> Custom rule forwards to container only if auth header is present
			> Default rule returns Forbidden
		Also restricting access to CloudFront using a prefix list,
		see AWS Console => VPC => Managed Prefix Lists
		*/
		const listener = loadBalancer.addListener(generateResourceId('lb-listener'), {
			certificates: [certificate],
			open: false,
			protocol: ApplicationProtocol.HTTPS,
			defaultAction: ListenerAction.fixedResponse(403, {
				messageBody: 'You cannot access this resource directly',
			}),
		});
		listener.addTargets(generateResourceId('lb-target'), {
			targets: [fargateService],
			healthCheck: {
				path: '/api/health',
			},
			port: 80,
			conditions: [ListenerCondition.httpHeader(customAuthHeaderName, [customAuthHeaderValue])],
			priority: 1,
		});
		listener.connections.allowDefaultPortFrom(
			Peer.prefixList('pl-fab65393'),
			'Allow incoming traffic only from CloudFront'
		);

		new ARecord(this, generateResourceId('arecord-api'), {
			zone: hostedZone,
			recordName: apiDomainName,
			target: RecordTarget.fromAlias(new LoadBalancerTarget(loadBalancer)),
		});
	}
}
