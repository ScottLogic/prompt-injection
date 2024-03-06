import { sendRequest } from './backendService';

const PATH = 'email/';

async function clearEmails(level: number): Promise<boolean> {
	const response = await sendRequest(`${PATH}clear`, {
		method: 'POST',
		body: { level },
	});
	return response.status === 200;
}

export { clearEmails };
