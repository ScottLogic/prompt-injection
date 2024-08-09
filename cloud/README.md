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

The pipeline only needs to be synthesized and deployed once, after which it will self-update whenever triggered. It is
currently configured to run on merging to `main` branch, so adjust that if you want to trigger on a different branch.

`npm run cdk:synth`  
Generates the CloudFormation templates for a "dev stage" build pipeline.

`npm run cdk:synth:prod`  
Generates the CloudFormation templates for a "production stage" build pipeline.

`npm run cdk:synth -- --context STAGE={STAGENAME}`  
Generates the CloudFormation templates for a build pipeline, stage given by `{STAGENAME}`.

`npm run cdk:deploy:all`  
Deploys the synthesized pipeline to an AWS Environment, as defined by your active AWS config profile.

`npm run cdk:destroy:all`  
Destroys the deployed pipeline in your remote AWS Environment.

Note that destroying the pipeline stack does not destroy the application stacks deployed by the pipeline, so those would
need to be deleted manually in the AWS Console.

## Testing stack changes

As the pipeline deploys the application stacks, it is wise to test any changes to those stacks before committing them.
You can do this by synthesizing just the application stacks locally, and deploying to AWS as `dev` stage.

There is one small task to complete before you begin. In AWS Secrets Manager, you will find a secret storing API key and
secret values for the `prod` stage, which the server needs for successful startup. You must create a new secret for the
dev stage, with the same OPENAI_API_KEY value and any random string for SESSION_SECRET. Once that is in place, you can
synthesize and deploy the stacks for testing. Once you have finished, please delete the secret to avoid unnecessary
costs.

`npm run cdk:test:synth` - synthesizes just the application stacks (i.e. not the pipeline)

`npm run cdk:test:deploy` - deploys these stacks to AWS as "dev" stage

All being successful, you should see the application login screen at `https://dev.spylogic.ai`. Log into the AWS Console to add a
user to the dev Cognito userpool, then log into the UI to test app deployment was successful.

`npm run cdk:test:destroy` - Remember to destroy the stacks after testing, else you will rack up costs!

---

## A note on costs

At the time of writing, current infrastructure costs us around $60 per month, with just two AZs for the load balancer,
deployed into `eu-north-1`. This is one of the [greenest AWS regions](https://app.electricitymaps.com/map), but costs
are about average. The vast majority of the bill is for the VPC, Load Balancer and NAT EC2 Instance. We have tasks on
our todo list to reduce these costs (such as removing the NAT Instance in favour of IPv6 egress), but those are
work-in-progress.

The bottom line: remember to destroy your stacks when no longer needed!

## First-time admin tasks

When setting up the CDK project for the first time, there are a few one-time tasks you must complete.

### Bootstrapping the CDK using a Developer Policy

In order to deploy AWS resources to a remote environment using CDK, you must first
[bootstrap the CDK](https://docs.aws.amazon.com/cdk/v2/guide/bootstrapping.html). For this project, as per
[CDK guidelines](https://aws.amazon.com/blogs/devops/secure-cdk-deployments-with-iam-permission-boundaries/), we are
using a lightweight permissions boundary to restrict permissions, to prevent creation of new users or roles with
elevated permissions. See `cdk-developer-policy.yaml` for details.

Note that once the pipeline is deployed, it is a good idea to restrict permissions further, so that only the pipeline
can make changes to the stacks.

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

Unless your default region is `us-east-1`, you will also need to bootstrap this region, as certificates for CloudFront
currently need to be deployed there:

```
npx cdk bootstrap --custom-permissions-boundary cdk-developer-policy aws://YOUR_ACCOUNT_NUMBER/us-east-1
```

### Server secrets

The Node Express server needs a couple of secret values, which are injected into the container environment during
deployment via AWS Secrets Manager.

You will need to create a secret in your chosen region named `{stagename}/SpyLogic/ApiKey`, where stagename matches the
name used during Synth (for example, "dev" or "prod"). Within this secret, you will need values for OPENAI_API_KEY and
SESSION_SECRET.

Refer to the [main README](../README.md) for further details on these.
