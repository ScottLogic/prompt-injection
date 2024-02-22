import { sendRequest } from './backendService';

const PATH = 'reset';

async function resetAllLevelProgress(): Promise<boolean> {
	const response = await sendRequest(PATH, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
	});
	return response.status === 200;
}

export { resetAllLevelProgress };
