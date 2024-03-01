import { sendRequest } from './backendService';

const PATH = 'reset';

async function resetAllLevelProgress(): Promise<boolean> {
	const response = await sendRequest(PATH, {
		method: 'POST',
	});
	return response.status === 200;
}

export { resetAllLevelProgress };
