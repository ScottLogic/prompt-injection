import { Construct } from 'constructs';

export const appName = 'SpyLogic';

export const stageName = (construct: Construct) =>
	(construct.node.tryGetContext('STAGE') as string) || 'dev';

export const resourceId = (construct: Construct) => (suffix: string) =>
	`${stageName(construct)}-${appName}-${suffix}`.toLowerCase();

export const resourceDescription = (construct: Construct) => (prefix: string) =>
	`${prefix} for ${appName} (${stageName(construct)})`;

export const stackName = (construct: Construct) => (name: string) =>
	resourceId(construct)(`${name}-stack`);
