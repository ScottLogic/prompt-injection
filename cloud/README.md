# SpyLogic : AWS CDK project

This project uses AWS CDK (with TypeScript) to build CloudFormation templates for deployment of all resources for the
SpyLogic application. The main stack defines a CodePipeline, configured with a single Stage to deploy the application
stacks on merging into the repo `main` branch.

The API layer is a _fairly_ typical containerized Node Express server, managed by AWS Fargate with a load-balancer in
front. The UI is S3-hosted and served through CloudFront, and Cognito handles AuthN / AuthZ.

There is some complication arising from the desire to initiate authentication in the UI using AWS Amplify, and then
authorize users (via Cognito) when accessing the API. This seemingly simple task is not natively supported by AWS
Application Load Balancer (ALB), which only allows _initiating_ authentication rather than verifying an existing access
token. The solution is to re-use our CloudFront distribution for the UI to proxy API requests as well, with an Edge
function to verify the token and, if verified, insert a custom header into the request before passing to the load
balancer. We then filter requests at the load balancer, and reject any requests without the expected header and value,
to prevent attempts to bypass auth.

This should be much easier, as it is natively supported by API Gateway, but it seems ALB is yet to catch up.

## Commands

The pipeline only needs to be synthesized and deployed once, after which it will self-update whenever triggered. It is
currently configured to run on merging to `main` branch, so adjust that if you want to trigger on a different branch.

`npm run cdk:synth`  
Generates the CloudFormation templates for a "dev stage" build pipeline.

`npm run cdk:synth:prod`  
Generates the CloudFormation templates for a "production stage" build pipeline.

`npm run cdk:synth -- --context STAGE={STAGENAME}`  
Generates the CloudFormation templates for a build pipeline, for the given stage name

`npm run cdk:deploy:all`  
Deploys the synthesized pipeline to an AWS Environment, as defined by your active AWS config profile.

`npm run cdk:destroy:all`  
Destroys the deployed pipeline in your remote AWS Environment.

Note that destroying the pipeline stack does not destroy the application stacks deployed by the pipeline, so those would
need to be deleted manually in the AWS Console.

## Testing stack changes

As the pipeline deploys the application stacks, it is wise to test any changes to those stacks before committing them.
You can do this by synthesizing just the application stacks locally, and deploying to AWS as `dev` stage.

Before you begin, ensure you have added [your API key](#server-secrets) into AWS Secrets Manager, for the dev stage.
Once you have finished testing, we recommend deleting the secret to avoid unnecessary costs.

```shell
# synthesize the application stacks (no pipeline)
npm run cdk:test:synth

# deploy resources to AWS as "dev" stage
npm run cdk:test:deploy
```

Once this is complete, you will need to set some environment vars for the UI build. Copy the following stack outputs
from the above deployment command into file `frontend/.env`, using [.env.example](../frontend/.env.example) as a
template:

- from dev-spylogic-auth-stack,
  copy UserPoolId, UserPoolClient and UserPoolDomain into corresponding properties
- from dev-spylogic-hostedzone-stack,
  copy `HostUrl` into VITE_COGNITO_REDIRECT_URL, and `BackendUrl` into VITE_BACKEND_URL

Also uncomment VITE_AUTH_PROVIDER. Once that is done, run the following commands:

```shell
# Build the UI
cd ../frontend
npm run build

# Deploy to S3
aws s3 sync dist s3://dev-spylogic-host-bucket
```

All being successful, you should see the login screen when you navigate to the `HostUrl` (see above).
Before you can sign in, you'll need to add a user to the dev userpool in Cognito, in AWS Console. After that, log into
the application UI and check everything works as expected - including authenticated calls to the API, and session
persistence via the SpyLogic.sid secure cookie.

Finally, remember to destroy the stacks after testing, else you will rack up costs:

```shell
# Tear down all deployed resources
npm run cdk:test:destroy
```

## Troubleshooting

- `SSOTokenProviderFailure: SSO Token refresh failed. Please log in using "aws sso login"` - Go on, try it!
- Deployment of the spylogic-api-stack fails with "docker authorization token expired" error. Try this:
  [docker login for AWS](https://stackoverflow.com/a/66919813)
- AccessDenied page when accessing UI. If deploying manually for testing the stacks, did you forget to deploy the UI to
  the host bucket? If deployed via the pipeline, check CodePipeline in AWS Console to see if the task failed.
- UI seems stuck on old version even after merging to main. Is the pipeline awaiting manual approval? This can happen
  if changes made to a stack broaden any required permissions.

## A note on costs

At the time of writing, current infrastructure costs us around $60 per month, with just two AZs for the load balancer,
deployed into `eu-north-1`. This is one of the [greenest AWS regions](https://app.electricitymaps.com/map), but costs
are about average. The vast majority of the bill is for the VPC, Load Balancer and NAT EC2 Instance. We have tasks on
our todo list to reduce these costs (radical idea: convert container app to REDIS-backed lambdas).

The bottom line: remember to destroy your stacks when no longer needed!

## First-time admin tasks

When setting up the CDK project for the first time, there are a few one-time tasks you must complete.

### Bootstrapping the CDK

In order to deploy AWS resources to a remote environment using CDK, you must first
[bootstrap the CDK](https://docs.aws.amazon.com/cdk/v2/guide/bootstrapping.html). For this project, as per
[CDK guidelines](https://aws.amazon.com/blogs/devops/secure-cdk-deployments-with-iam-permission-boundaries/), we are
using a lightweight permissions boundary to restrict permissions, to prevent creation of new users or roles with
elevated permissions. See `cdk-developer-policy.yaml` for details.

We also have a set of [IAM Managed Policies](./permissions/README.md) that restrict what CloudFormation is allowed to
do, as CDK by default allows full AdministratorAccess! 😵 🤢 🤮

Note that once the pipeline is deployed, it's a good idea to restrict permissions for developers further, so that only
the pipeline can make changes to the stacks, via approved GitHub merges.

1. Create permissions boundary stack

```shell
aws cloudformation create-stack \
  --stack-name CDKDeveloperPolicy \
  --template-body file://cdk-developer-policy.yaml \
  --capabilities CAPABILITY_NAMED_IAM
```

2. Create IAM managed policies

```shell
aws iam create-policy \
  --policy-name cdk-execution-policy-basics \
  --policy-document file://permissions/execution_policy_basics.json \
  --description "Baseline permissions for cloudformation deployments"

aws iam create-policy \
  --policy-name cdk-execution-policy-cloudfront \
  --policy-document file://permissions/execution_policy_cloudfront.json \
  --description "Permissions to deploy cloudfront resources, except for lambda@edge functions"

aws iam create-policy \
  --policy-name cdk-execution-policy-cognito \
  --policy-document file://permissions/execution_policy_cognito.json \
  --description "Permissions to deploy cognito userpools and related resources"

aws iam create-policy \
  --policy-name cdk-execution-policy-edgelambda \
  --policy-document file://permissions/execution_policy_edgelambda.json \
  --description "Permissions to deploy lambda@edge functions for a cloudfront distribution"

aws iam create-policy \
  --policy-name cdk-execution-policy-pipeline \
  --policy-document file://permissions/execution_policy_pipeline.json \
  --description "Permissions to deploy a codepipeline and codebuild projects"

aws iam create-policy \
  --policy-name cdk-execution-policy-route53 \
  --policy-document file://permissions/execution_policy_route53.json \
  --description "Permissions to deploy domain records and ACM certificates"

aws iam create-policy \
  --policy-name cdk-execution-policy-vpc \
  --policy-document file://permissions/execution_policy_vpc.json \
  --description "Permissions to deploy VPC, EC2 and ECS resources for a Fargate-managed container app"
```

3. Bootstrap the CDK environment

```shell
# install dependencies if you've not already done so
npm install
```

If your primary region is NOT `us-east-1`, you will need to bootstrap that region as well, as
currently Lambda@Edge functions can only be deployed to `us-east-1`:

```shell
# Bootstrap primary region
npx cdk bootstrap aws://{account}/{region} \
  --custom-permissions-boundary cdk-developer-policy \
  --cloudformation-execution-policies "arn:aws:iam::{account}:policy/cdk-execution-policy-basics,arn:aws:iam::{account}:policy/cdk-execution-policy-cloudfront,arn:aws:iam::{account}:policy/cdk-execution-policy-cognito,arn:aws:iam::{account}:policy/cdk-execution-policy-pipeline,arn:aws:iam::{account}:policy/cdk-execution-policy-route53,arn:aws:iam::{account}:policy/cdk-execution-policy-vpc"

# Bootstrap us-east-1 for cloudfront
npx cdk bootstrap aws://{account}/us-east-1 \
  --custom-permissions-boundary cdk-developer-policy \
  --cloudformation-execution-policies "arn:aws:iam::{account}:policy/cdk-execution-policy-basics,arn:aws:iam::{account}:policy/cdk-execution-policy-edgelambda"
```

If your primary region IS `us-east-1`, then you only need one bootstrap command:

```shell
# Bootstrap us-east-1
npx cdk bootstrap aws://{account}/us-east-1 \
  --custom-permissions-boundary cdk-developer-policy \
  --cloudformation-execution-policies "arn:aws:iam::{account}:policy/cdk-execution-policy-basics,arn:aws:iam::{account}:policy/cdk-execution-policy-cloudfront,arn:aws:iam::{account}:policy/cdk-execution-policy-cognito,arn:aws:iam::{account}:policy/cdk-execution-policy-edgelambda,arn:aws:iam::{account}:policy/cdk-execution-policy-pipeline,arn:aws:iam::{account}:policy/cdk-execution-policy-route53,arn:aws:iam::{account}:policy/cdk-execution-policy-vpc"
```

### SSM Parameters

There are two Parameters needed when the stacks are deployed, so ensure these are added before you deploy the
pipeline first time:

- `DOMAIN_NAME` - Domain where the application will be available
- `HOSTED_ZONE_ID` - We advise you create your Hosted Zone manually (via the AWS Console) before deploying the stacks

### Server secrets

The Node Express server needs a couple of secret values, which are injected into the container environment during
deployment via AWS Secrets Manager.

You will need to create a secret in your chosen region named `{stagename}/SpyLogic/ApiKey`, where stagename matches the
name used during Synth (for example, "dev" or "prod"). Within this secret, you will need values for OPENAI_API_KEY and
SESSION_SECRET.

Refer to the [main README](../README.md) for further details on these.
