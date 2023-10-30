# CDK project for Prompt Injection

This project uses AWS CDK (using TypeScript) to define CloudFormation templates for remote deployment of all resources
for the Prompt Injection application.

The architecture is a typical containerized node-express API managed by AWS Fargate and ECS, with load-balancing (ELB),
plus an S3-hosted UI served through CloudFront, all secured using Cognito.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Commands

- `npm run cdk:synth` - generates the CloudFormation templates, outputting into `./cdk.out` dir.
- `npm run cdk:deploy` - deploys the application stacks into the remote DEV stage.  
  _Caution! This will overwrite existing resources, so ensure the team are notified before running this manually._

Note that once the CDK Pipeline is in place, DEV deployment will happen automatically on merging into dev branch.
