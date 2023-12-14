import { sendRequest } from './backendService';

async function resetAllLevelProgress(): Promise<boolean> {
	const response = await sendRequest(
		`/reset`,
		'POST',
		{
			'Content-Type': 'application/json',
		},
		JSON.stringify({})
	);
	return response.status === 200;
}

export { resetAllLevelProgress };
