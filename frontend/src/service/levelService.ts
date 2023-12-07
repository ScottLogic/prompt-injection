import { sendRequest } from './backendService';

async function resetAllLevelProgress(): Promise<void> {
	const response = await sendRequest(
		`/reset`,
		'POST',
		{
			'Content-Type': 'application/json',
		},
		JSON.stringify({})
	);
	console.log(response);
}

export { resetAllLevelProgress };
