# IAM Execution Policies

It's a bad idea to give AdministratorAccess to the CloudFormation execution role, even with a permissions boundary in
place. Instead, we have custom policies authorizing all actions needed to deploy the stacks:

- `execution_policy_basics.json` Basic permissions for CDK deployments, including Lambda creation and execution
- `execution_policy_cloudfront.json` Permissions for creating a site Distribution with associated behaviors, cache
  policies and origin forwarding policies
- `execution_policy_cognito.json` Permissions required for Cognito userpools, clients and domains
- `execution_policy_edgelambda.json` Permissions to create a Cloudfront Lambda@Edge function (in us-east-1)
- `execution_policy_pipeline.json` Permissions for deploying the pipeline, which then orchestrates all other stacks
- `execution_policy_route53.json` Permissions required for Route53 records and ACM certificates
- `execution_policy_vpc.json` Permissions for deploying, updating and destroying a load-balanced, Fargate-managed
  container

## Commands

Refer to the [Cloud README](../README.md) for commands to create these using AWS CLI.
