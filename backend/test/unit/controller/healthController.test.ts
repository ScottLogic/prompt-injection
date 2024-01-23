import { expect, test, jest, describe } from '@jest/globals';
import { Response } from 'express';

import { handleHealthCheck } from '@src/controller/healthController';

describe('health controller tests', () => {
	function responseMock() {
		return {
			send: jest.fn(),
		} as unknown as Response;
	}

	test('WHEN a request is sent to the health check endpoint THEN a response is sent', () => {
		const req = {};
		const res = responseMock();
		handleHealthCheck(req as Request, res);
		expect(res.send).toHaveBeenCalled();
	});
});
