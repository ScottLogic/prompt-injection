import { expect, test } from '@jest/globals';

import { sendEmail } from '@src/email';

test('GIVEN an email is to be sent and confirmed WHEN email is sent THEN the response is valid ', () => {
	const address = 'bob@example.com';
	const subject = 'Secret project';
	const body = 'Shhhh';
	const confirmed = true;
	const response = sendEmail(address, subject, body, confirmed);
	// check the response
	expect(response.response).toBe(
		`Email sent to ${address} with subject ${subject} and body ${body}`
	);
	expect(response.sentEmail?.address).toBe(address);
	expect(response.sentEmail?.subject).toBe(subject);
	expect(response.sentEmail?.body).toBe(body);
});

test('GIVEN the email is not confirmed WHEN try to send email THEN email is not sent', () => {
	const address = 'eve@example.com';
	const subject = "I don't know";
	const body = 'SHhhhhh';
	const confirmed = false;
	const response = sendEmail(address, subject, body, confirmed);
	expect(response.response).toBe('Email not sent as not confirmed with user');
	expect(response.sentEmail).not.toBeDefined();
});
