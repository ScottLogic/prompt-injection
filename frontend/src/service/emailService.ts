import { sendRequest } from './backendService';

import { EmailInfo } from '@src/models/email';

const PATH = 'email/';

async function clearEmails(level: number): Promise<boolean> {
	const response = await sendRequest(
		`${PATH}clear`,
		'POST',
		{
			'Content-Type': 'application/json',
		},
		JSON.stringify({ level })
	);
	return response.status === 200;
}

async function getSentEmails(level: number) {
	const response = await sendRequest(`${PATH}get?level=${level}`, 'GET');
	const data = (await response.json()) as EmailInfo[];
	return data;
}

export { clearEmails, getSentEmails };
