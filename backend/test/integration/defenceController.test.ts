import { expect, test, jest, describe } from '@jest/globals';
import { Response } from 'express';

import {
	handleConfigureDefence,
	handleDefenceActivation,
	handleDefenceDeactivation,
	handleGetDefenceStatus,
} from '@src/controller/defenceController';
import { DefenceActivateRequest } from '@src/models/api/DefenceActivateRequest';
import { DefenceConfigureRequest } from '@src/models/api/DefenceConfigureRequest';
import { DefenceStatusRequest } from '@src/models/api/DefenceStatusRequest';
import { DEFENCE_ID } from '@src/models/defence';
import { LEVEL_NAMES, getInitialLevelStates } from '@src/models/level';

function responseMock() {
	return {
		send: jest.fn(),
		status: jest.fn().mockReturnThis(),
	} as unknown as Response;
}

describe('The correct levels can have their defences changed', () => {
	[LEVEL_NAMES.LEVEL_1, LEVEL_NAMES.LEVEL_2].forEach((level) => {
		test(`GIVEN level ${
			level + 1
		} WHEN attempt to activate a defence THEN defence is not activated`, () => {
			const req = {
				body: {
					defenceId: DEFENCE_ID.CHARACTER_LIMIT,
					level,
				},
				session: {
					levelState: getInitialLevelStates(),
				},
			} as unknown as DefenceActivateRequest;

			const res = responseMock();

			handleDefenceActivation(req, res);

			expect(res.status).toHaveBeenCalledWith(400);
			expect(res.send).toHaveBeenCalledWith(
				'You cannot activate defences on this level, because it uses the default defences'
			);
		});

		test(`GIVEN level ${
			level + 1
		} WHEN attempt to deactivate a defence THEN defence is not activated`, () => {
			const req = {
				body: {
					defenceId: DEFENCE_ID.CHARACTER_LIMIT,
					level,
				},
				session: {
					levelState: getInitialLevelStates(),
				},
			} as unknown as DefenceActivateRequest;

			const res = responseMock();

			handleDefenceDeactivation(req, res);

			expect(res.status).toHaveBeenCalledWith(400);
			expect(res.send).toHaveBeenCalledWith(
				'You cannot deactivate defences on this level, because it uses the default defences'
			);
		});

		test(`GIVEN level ${
			level + 1
		} WHEN attempt to configure a defence THEN defence is not configured`, () => {
			const req = {
				body: {
					defenceId: DEFENCE_ID.CHARACTER_LIMIT,
					level,
					config: [],
				},
				session: {
					levelState: getInitialLevelStates(),
				},
			} as unknown as DefenceConfigureRequest;

			const res = responseMock();

			handleConfigureDefence(req, res);

			expect(res.status).toHaveBeenCalledWith(400);
			expect(res.send).toHaveBeenCalledWith(
				'You cannot configure defences on this level, because it uses the default defences'
			);
		});

		test(`GIVEN level ${
			level + 1
		} WHEN attempt to get defence status THEN shoult return undefined`, () => {
			const req = {
				query: { level },
				session: {
					levelState: getInitialLevelStates(),
				},
			} as unknown as DefenceStatusRequest;

			const res = responseMock();

			handleGetDefenceStatus(req, res);

			expect(res.send).toHaveBeenCalledWith(undefined);
		});
	});
});
