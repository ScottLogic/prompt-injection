import { expect, test, jest, describe } from '@jest/globals';
import { Response } from 'express';

import { handleClearEmails } from '@src/controller/emailController';
import { EmailClearRequest } from '@src/models/api/EmailClearRequest';
import { EmailInfo } from '@src/models/email';

function responseMock() {
	return {
		send: jest.fn(),
		status: jest.fn(),
	} as unknown as Response;
}

const emails: EmailInfo[] = [
	{
		address: 'bob@scottlogic.com',
		subject: 'Welcome to Scott Logic!',
		body: 'Hi Bob, welcome to Scott Logic!',
	},
	{
		address: 'jane@scottlogic.com',
		subject: 'Hello',
		body: 'Hi Jane, welcome to Scott Logic!',
	},
];

describe('handleClearEmails', () => {
	test('GIVEN valid level WHEN handleClearEmails called THEN sets emails to empty', () => {
		const req = {
			body: {
				level: 0,
			},
			session: {
				levelState: [
					{
						sentEmails: emails,
					},
				],
			},
		} as EmailClearRequest;

		const res = responseMock();

		handleClearEmails(req, res);

		expect(req.session.levelState[0].sentEmails).toEqual([]);
	});

	test('GIVEN level is missing WHEN handleClearEmails called THEN returns 400', () => {
		const req = {
			body: {},
		} as EmailClearRequest;

		const res = responseMock();

		handleClearEmails(req, res);

		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.send).toHaveBeenCalled();
	});
});
