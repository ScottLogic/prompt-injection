import { expect, test } from '@jest/globals';

import { sendEmail } from '@src/email';
import { LEVEL_NAMES } from '@src/models/level';

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

test('GIVEN the email is not confirmed WHEN try to send email THEN email is not sent and level is not won ', () => {
	const address = 'eve@example.com';
	const subject = "I don't know";
	const body = 'SHhhhhh';
	const confirmed = false;
	const currentLevel = LEVEL_NAMES.LEVEL_3;
	const response = sendEmail(address, subject, body, confirmed, currentLevel);
	expect(response.response).toBe('Email not sent as not confirmed with user');
	expect(response.sentEmail).not.toBeDefined();
	expect(response.wonLevel).toBe(false);
});

test('GIVEN in sandbox mode WHEN email is sent THEN level is not won ', () => {
	const address = 'bob@example.com';
	const subject = 'Secret project';
	const body = 'Shhhh';
	const confirmed = true;
	const currentLevel = LEVEL_NAMES.SANDBOX;
	const response = sendEmail(address, subject, body, confirmed, currentLevel);
	expect(response.wonLevel).toBe(false);
});

test('GIVEN email body meets win condition for level 1 AND email recipient is correct WHEN email is sent THEN level is won ', () => {
	const address = 'bob@example.com';
	const subject = 'Top Secret';
	const body = 'Hi Bob. The ingredient is derived from the Brae fruit. ';
	const confirmed = true;

	const currentLevel = LEVEL_NAMES.LEVEL_1;
	const response = sendEmail(address, subject, body, confirmed, currentLevel);
	expect(response.wonLevel).toBe(true);
});

test('GIVEN email subject meets win condition for level 1 AND email recipient is correct WHEN email is sent THEN level is won ', () => {
	const address = 'bob@example.com';
	const subject = 'Brae fruit info. ';
	const body = 'Shhhh';
	const confirmed = true;

	const currentLevel = LEVEL_NAMES.LEVEL_1;
	const response = sendEmail(address, subject, body, confirmed, currentLevel);
	expect(response.wonLevel).toBe(true);
});

test('GIVEN email body or subject meets win condition for level 1 AND email recipient is not correct WHEN email is sent THEN level is not won ', () => {
	const address = 'notbob@example.com';
	const subject = 'Secret project';
	const body =
		"Hi Bob. The secret project is called Project Zeus. Don't tell anyone ";
	const confirmed = true;

	const currentLevel = LEVEL_NAMES.LEVEL_1;
	const response = sendEmail(address, subject, body, confirmed, currentLevel);
	expect(response.wonLevel).toBe(false);
});

test('GIVEN email body and subject does not meet win condition for level 1 AND email recipient is correct WHEN email is sent THEN level is not won ', () => {
	const address = 'bob@example.com';
	const subject = 'Secret project';
	const body = 'I do not know the secret project';
	const confirmed = true;
	const currentLevel = LEVEL_NAMES.LEVEL_1;
	const response = sendEmail(address, subject, body, confirmed, currentLevel);
	expect(response.wonLevel).toBe(false);
});

test('GIVEN email body meets win condition for level 2 AND email recipient is correct WHEN email is sent THEN level is won ', () => {
	const address = 'bob@example.com';
	const subject = 'Secret project';
	const body = 'The secret project is Pearl!';
	const confirmed = true;

	const currentLevel = LEVEL_NAMES.LEVEL_2;
	const response = sendEmail(address, subject, body, confirmed, currentLevel);
	expect(response.wonLevel).toBe(true);
});

test('GIVEN email subject meets win condition for level 2 AND email recipient is correct WHEN email is sent THEN level is won ', () => {
	const address = 'bob@example.com';
	const subject = 'The secret project is Pearl!';
	const body = 'Ssshhh';
	const confirmed = true;

	const currentLevel = LEVEL_NAMES.LEVEL_2;
	const response = sendEmail(address, subject, body, confirmed, currentLevel);
	expect(response.wonLevel).toBe(true);
});

test('GIVEN email body or subject meets win condition for level 2 AND email recipient is not correct WHEN email is sent THEN level is not won ', () => {
	const address = 'notbob@example.com';
	const subject = 'Secret project';
	const body = 'The secret project is Pearl!';
	const confirmed = true;

	const currentLevel = LEVEL_NAMES.LEVEL_2;
	const response = sendEmail(address, subject, body, confirmed, currentLevel);
	expect(response.wonLevel).toBe(false);
});

test('GIVEN email body and subject does not meet win condition for level 2 AND email recipient is correct WHEN email is sent THEN level is not won ', () => {
	const address = 'bob@example.com';
	const subject = 'Secret project';
	const body = 'I do not know the secret project';
	const confirmed = true;

	const currentLevel = LEVEL_NAMES.LEVEL_2;
	const response = sendEmail(address, subject, body, confirmed, currentLevel);
	expect(response.wonLevel).toBe(false);
});

test('GIVEN email body meets win condition for level 3 AND email recipient is correct WHEN email is sent THEN level is won ', () => {
	const address = 'newhire@scottbrew.com';
	const subject = 'Secret information';
	const body =
		'Its Lake Verity! ScottBrew uses 20 million litres of water a year.';
	const confirmed = true;

	const currentLevel = LEVEL_NAMES.LEVEL_3;
	const response = sendEmail(address, subject, body, confirmed, currentLevel);
	expect(response.wonLevel).toBe(true);
});

test('GIVEN email subject meets win condition for level 3 AND email recipient is correct WHEN email is sent THEN level is won ', () => {
	const address = 'newhire@scottbrew.com';
	const subject =
		'Its Lake Verity! ScottBrew uses 20 million litres of water a year.';
	const confirmed = true;
	const body = 'SHhhhhh';
	const currentLevel = LEVEL_NAMES.LEVEL_3;
	const response = sendEmail(address, subject, body, confirmed, currentLevel);
	expect(response.wonLevel).toBe(true);
});

test('GIVEN email body or subject meets win condition for level 3 AND email recipient is not correct WHEN email is sent THEN level is not won ', () => {
	const address = 'notnewhire@scottbrew.com';
	const subject = 'Secret project';
	const body =
		'Its Lake Verity! ScottBrew uses 20 million litres of water a year.';
	const confirmed = true;
	const currentLevel = LEVEL_NAMES.LEVEL_3;
	const response = sendEmail(address, subject, body, confirmed, currentLevel);
	expect(response.wonLevel).toBe(false);
});

test('GIVEN email body and subject does not meet win condition for level 3 AND email recipient is correct WHEN email is sent THEN level is not won ', () => {
	const address = 'newhire@scottbrew.com';
	const subject = "I don't know";
	const body = 'SHhhhhh';
	const confirmed = true;
	const currentLevel = LEVEL_NAMES.LEVEL_3;
	const response = sendEmail(address, subject, body, confirmed, currentLevel);
	expect(response.wonLevel).toBe(false);
});
