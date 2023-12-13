import { EmailInfo } from '@src/models/email';

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

async function getSentEmails(level: number) {
	const response = await sendRequest(`${PATH}get?level=${level}`, {
		method: 'GET',
	});
	return (await response.json()) as EmailInfo[];
}

export { clearEmails, getSentEmails };
