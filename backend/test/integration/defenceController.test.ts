import { expect, test, jest, describe } from '@jest/globals';
import { Response } from 'express';

import {
	handleConfigureDefence,
	handleDefenceActivation,
	handleDefenceDeactivation,
	handleResetDefenceConfigItem,
} from '@src/controller/defenceController';
import { DefenceActivateRequest } from '@src/models/api/DefenceActivateRequest';
import { DefenceConfigItemResetRequest } from '@src/models/api/DefenceConfigResetRequest';
import { DefenceConfigureRequest } from '@src/models/api/DefenceConfigureRequest';
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
	});

	[LEVEL_NAMES.LEVEL_3, LEVEL_NAMES.SANDBOX].forEach((level) => {
		test(`GIVEN level ${level} WHEN attempt to activate a defence THEN defence is activated`, () => {
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

			const newLevelState = getInitialLevelStates().map((levelState) =>
				levelState.level === level
					? {
							...levelState,
							defences: levelState.defences?.map((defence) =>
								defence.id === DEFENCE_ID.CHARACTER_LIMIT
									? { ...defence, isActive: true }
									: defence
							),
					  }
					: levelState
			);

			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.send).toHaveBeenCalled();
			expect(req.session.levelState).toEqual(newLevelState);
		});

		test(`GIVEN level ${level} WHEN attempt to deactivate a defence THEN defence is deactivated`, () => {
			const initialLevelStatesButWithCharacterLimitActive =
				getInitialLevelStates().map((levelState) =>
					levelState.level === level
						? {
								...levelState,
								defences: levelState.defences?.map((defence) =>
									defence.id === DEFENCE_ID.CHARACTER_LIMIT
										? { ...defence, isActive: true }
										: defence
								),
						  }
						: levelState
				);

			const req = {
				body: {
					defenceId: DEFENCE_ID.CHARACTER_LIMIT,
					level,
				},
				session: {
					levelState: initialLevelStatesButWithCharacterLimitActive,
				},
			} as unknown as DefenceActivateRequest;

			const res = responseMock();

			handleDefenceDeactivation(req, res);

			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.send).toHaveBeenCalled();
			expect(req.session.levelState).toEqual(getInitialLevelStates());
		});
	});

	[LEVEL_NAMES.LEVEL_1, LEVEL_NAMES.LEVEL_2, LEVEL_NAMES.LEVEL_3].forEach(
		(level) => {
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
			} WHEN attempt to reset a defence config item THEN defence config item is not reset`, () => {
				const req = {
					body: {
						defenceId: DEFENCE_ID.CHARACTER_LIMIT,
						level,
						configItemId: 'MAX_MESSAGE_LENGTH',
					},
					session: {
						levelState: getInitialLevelStates(),
					},
				} as DefenceConfigItemResetRequest;

				const res = responseMock();

				handleResetDefenceConfigItem(req, res);

				expect(res.status).toHaveBeenCalledWith(400);
				expect(res.send).toHaveBeenCalledWith(
					'You cannot reset defence config items on this level, because it uses the default defences'
				);
			});
		}
	);

	test(`GIVEN level sandbox WHEN attempt to configure a defence THEN defence is configured`, () => {
		const req = {
			body: {
				defenceId: DEFENCE_ID.CHARACTER_LIMIT,
				level: LEVEL_NAMES.SANDBOX,
				config: [{ id: 'MAX_MESSAGE_LENGTH', value: '1' }],
			},
			session: {
				levelState: getInitialLevelStates(),
			},
		} as DefenceConfigureRequest;

		const res = responseMock();

		handleConfigureDefence(req, res);

		const updatedDefenceConfig = req.session.levelState
			.find((levelState) => levelState.level === LEVEL_NAMES.SANDBOX)
			?.defences?.find(
				(defence) => defence.id === DEFENCE_ID.CHARACTER_LIMIT
			)?.config;

		const expectedDefenceConfig = [{ id: 'MAX_MESSAGE_LENGTH', value: '1' }];

		expect(res.send).toHaveBeenCalled();
		expect(updatedDefenceConfig).toEqual(expectedDefenceConfig);
	});

	test(`GIVEN level Sandbox WHEN attempt to reset a defence config item THEN defence config item is reset`, () => {
		const initialLevelStatesButWithCharacterLimitConfigured =
			getInitialLevelStates().map((levelState) =>
				levelState.level === LEVEL_NAMES.SANDBOX
					? {
							...levelState,
							defences: levelState.defences?.map((defence) =>
								defence.id === DEFENCE_ID.CHARACTER_LIMIT
									? {
											...defence,
											config: [{ id: 'MAX_MESSAGE_LENGTH', value: '1' }],
									  }
									: defence
							),
					  }
					: levelState
			);

		const req = {
			body: {
				defenceId: DEFENCE_ID.CHARACTER_LIMIT,
				level: LEVEL_NAMES.SANDBOX,
				configItemId: 'MAX_MESSAGE_LENGTH',
			},
			session: {
				levelState: initialLevelStatesButWithCharacterLimitConfigured,
			},
		} as DefenceConfigItemResetRequest;

		const res = responseMock();

		handleResetDefenceConfigItem(req, res);

		expect(req.session.levelState).toEqual(getInitialLevelStates());
		expect(res.send).toHaveBeenCalledWith({
			id: 'MAX_MESSAGE_LENGTH',
			value: '280',
		});
	});
});
