import { ECS } from '@aws-sdk/client-ecs';

export type ServiceEventLambda = {
	operation: 'start' | 'stop';
};

export const handler = async (event: ServiceEventLambda) => {
	const { operation } = event;
	const { CLUSTER_NAME, SERVICE_NAME } = process.env;
	const operationDesc = operation === 'start' ? 'started' : 'stopped';
	const ecs = new ECS();

	try {
		await ecs.updateService({
			cluster: CLUSTER_NAME,
			service: SERVICE_NAME,
			desiredCount: operation === 'start' ? 1 : 0,
		});
		console.log(`${SERVICE_NAME} was ${operationDesc}`);
	} catch (err) {
		console.log(`${SERVICE_NAME} could not be ${operationDesc}`);
		console.warn(err);
	}
};
