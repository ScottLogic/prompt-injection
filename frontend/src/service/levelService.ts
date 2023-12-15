import { sendRequest } from './backendService';

async function resetAllLevelProgress(): Promise<boolean> {
	const response = await sendRequest(`/reset`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
	});
	return response.status === 200;
}

export { resetAllLevelProgress };
