import { sendRequest } from './backendService';

async function resetAllLevelProgress(): Promise<boolean> {
	const response = await sendRequest(`/reset`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({}),
	});
	return response.status === 200;
}

export { resetAllLevelProgress };
