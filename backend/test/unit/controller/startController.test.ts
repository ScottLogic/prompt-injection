import { expect, test, jest } from '@jest/globals';
import { Response } from 'express';

import { handleStart } from '@src/controller/startController';

function responseMock() {
	return {
		send: jest.fn(),
		status: jest.fn(),
	} as unknown as Response;
}

test('dummy test', () => {
	const req;
	const res = responseMock();

	handleStart(req, res);

	expect(true).toBe(true);
});
