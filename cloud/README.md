# SpyLogic : AWS CDK project

This project uses AWS CDK (with TypeScript) to build CloudFormation templates for deployment of all resources for the
SpyLogic application. The main stack defines a CodePipeline, configured with a single Stage to deploy the application
stacks on merging into the repo main branch.

The API layer is a _fairly_ typical containerized Node Express server, managed by AWS Fargate with a load-balancer in
front. The UI is S3-hosted and served through CloudFront, and Cognito handles AuthN / AuthZ.

There is some complication arising from the desire to initiate authentication in the UI using AWS Amplify, and then
authorize users (via Cognito) when accessing the API. This seemingly simple task is not natively supported by AWS
Application Load Balancer (ALB), which only allows _initiating_ authentication rather than verifying an existing access
token. The solution is to re-use our CloudFront distribution for the UI to proxy API requests as well, with an Edge
function to verify the token and, if verified, insert a custom header into the request before passing to the load
balancer. We then filter requests at the load balancer, and reject any requests without the expected header / value.

This should be much easier, as it is natively supported by API Gateway, but it seems ALB is yet to catch up.

## Commands

`npm run cdk:synth`  
Generates the CloudFormation templates for a build pipeline - dev stage.

`npm run cdk:synth:prod`  
Generates the CloudFormation templates for a build pipeline - production stage.

`npm run cdk:synth -- --context STAGE={STAGENAME}`  
Generates the CloudFormation templates for a build pipeline - stage given by `{STAGENAME}`.

`npm run cdk:deploy:all`  
Deploys the synthesized pipeline to an AWS Environment, as defined by your active AWS config profile.

Note that the pipeline only needs to be deployed once, after which it self-updates whenever it is triggered. It is
currently configured to run on merging to `main` branch, so adapt to your needs.

`npm run cdk:destroy:all`  
Destroys the deployed pipeline in your remote AWS Environment.

Destroying the pipeline stack does not destroy the application stacks, so those will need to be deleted manually in the
AWS Console.


Additionally, 

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

Unless your default region is `us-east-1`, you will also need to bootstrap that region, as certificates for CloudFront
currently need to be deployed into that region:

```
npx cdk bootstrap --custom-permissions-boundary cdk-developer-policy aws://YOUR_ACCOUNT_NUMBER/us-east-1
```
