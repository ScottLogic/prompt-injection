import { sendRequest } from './backendService';

const PATH = 'email/';

async function clearEmails(level: number): Promise<boolean> {
	const response = await sendRequest(`${PATH}clear`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ level }),
	});
	return response.status === 200;
}

export { clearEmails };
