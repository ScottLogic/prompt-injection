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

---

## First-time admin tasks

If you are setting up the CDK project for the first time, there are a few setup tasks you must complete.

### Bootstrapping the CDK using a Developer Policy

In order to deploy AWS resources to a remote environment using CDK, you must first
[bootstrap the CDK](https://docs.aws.amazon.com/cdk/v2/guide/bootstrapping.html). For this project, as per
[CDK guidelines](https://aws.amazon.com/blogs/devops/secure-cdk-deployments-with-iam-permission-boundaries/), we use a
lightweight permissions boundary to restrict permissions, to prevent creation of new users or roles with elevated
permissions. See `cdk-developer-policy.yaml` for details.

Create the permissions boundary CloudFormation stack:

```
aws cloudformation create-stack \
  --stack-name CDKDeveloperPolicy \
  --template-body file://cdk-developer-policy.yaml \
  --capabilities CAPABILITY_NAMED_IAM
```

Then bootstrap the CDK:

```
# install dependencies if not already done
npm install

# run the bootstrap command
npx cdk bootstrap --custom-permissions-boundary cdk-developer-policy
```
