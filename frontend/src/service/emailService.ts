import { EmailInfo } from '@src/models/email';

import { sendRequestOld } from './backendService';

const PATH = 'email/';

async function clearEmails(level: number): Promise<boolean> {
	const response = await sendRequestOld(
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
	const response = await sendRequestOld(`${PATH}get?level=${level}`, 'GET');
	const data = (await response.json()) as EmailInfo[];
	return data;
}

export { clearEmails, getSentEmails };
