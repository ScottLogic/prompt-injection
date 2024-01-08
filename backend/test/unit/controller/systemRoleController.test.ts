import { expect, test, jest, describe } from '@jest/globals';
import { Request, Response } from 'express';

import { handleGetSystemRoles } from '@src/controller/systemRoleController';
import { LEVEL_NAMES } from '@src/models/level';
import {
	systemRoleLevel1,
	systemRoleLevel2,
	systemRoleLevel3,
} from '@src/promptTemplates';

describe('systemRoleController unit tests', () => {
	function responseMock() {
		return {
			send: jest.fn(),
			status: jest.fn(),
		} as unknown as Response;
	}

	test('GIVEN a request THEN the systemRoleController should return a list of system roles', () => {
		const expectedSystemRoles = [
			{ level: LEVEL_NAMES.LEVEL_1, systemRole: systemRoleLevel1 },
			{ level: LEVEL_NAMES.LEVEL_2, systemRole: systemRoleLevel2 },
			{ level: LEVEL_NAMES.LEVEL_3, systemRole: systemRoleLevel3 },
		];

		const res = responseMock();
		handleGetSystemRoles({} as Request, res);

		expect(res.send).toHaveBeenCalledWith(expectedSystemRoles);
	});
});
