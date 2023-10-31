import { Stack, StackProps } from "aws-cdk-lib/core";
import { Vpc } from "aws-cdk-lib/aws-ec2";
import { DockerImageAsset } from "aws-cdk-lib/aws-ecr-assets";
import { Cluster, ContainerImage, Secret as EnvSecret } from "aws-cdk-lib/aws-ecs";
import { ApplicationLoadBalancedFargateService } from "aws-cdk-lib/aws-ecs-patterns";
import { Secret } from "aws-cdk-lib/aws-secretsmanager";
import { Construct } from "constructs";

import { resourceName, stageName } from "./resourceNamingUtils";

export class ApiStack extends Stack {
  stage: string;

  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);
    this.stage = stageName(scope);

    const generateResourceName = resourceName(scope);

    const dockerImageAsset = new DockerImageAsset(
      this,
      generateResourceName('container-image'),
      {
        directory: '../../backend',
      });

    // Default AZs is all in region, but for environment-agnostic stack, max is 2!
    const vpc = new Vpc(this, generateResourceName("vpc"), { maxAzs: 2 });
    const cluster = new Cluster(this, generateResourceName("cluster"), { vpc });

    const apiKeySecret = Secret.fromSecretNameV2(this, generateResourceName("apiKey"), "dev/SpyLogic/ApiKey")

    // Create a load-balanced Fargate service and make it public
    new ApplicationLoadBalancedFargateService(
      this,
      generateResourceName("fargate"),
      {
        cluster,
        cpu: 256, // Default is 256
        desiredCount: 1, // Bump this up for prod!
        taskImageOptions: {
          image: ContainerImage.fromDockerImageAsset(dockerImageAsset),
          environment: {
            NODE_ENV: "development",
            PORT: "3001",
          },
          secrets: {
            OPENAI_API_KEY: EnvSecret.fromSecretsManager(apiKeySecret, "OPENAI_API_KEY"),
          },
        },
        memoryLimitMiB: 512, // Default is 512
        loadBalancerName: generateResourceName("elb"),
        publicLoadBalancer: true, // Default is true
      },
    );
  }
}
