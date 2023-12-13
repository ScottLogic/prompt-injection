import { sendRequest } from './backendService';

const PATH = 'health/';

async function healthCheck() {
	const response = await sendRequest(PATH, 'GET');
	return response.status === 200;
}

export { healthCheck };
