import { expect, test, jest, describe } from '@jest/globals';
import { Response } from 'express';

import {
	handleConfigureDefence,
	handleDefenceActivation,
	handleDefenceDeactivation,
	handleGetDefenceStatus,
	handleResetDefenceConfigItem,
} from '@src/controller/defenceController';
import {
	activateDefence,
	configureDefence,
	deactivateDefence,
	resetDefenceConfig,
} from '@src/defence';
import { DefenceActivateRequest } from '@src/models/api/DefenceActivateRequest';
import { DefenceConfigItemResetRequest } from '@src/models/api/DefenceConfigResetRequest';
import { DefenceConfigureRequest } from '@src/models/api/DefenceConfigureRequest';
import { DefenceStatusRequest } from '@src/models/api/DefenceStatusRequest';
import { ChatMessage } from '@src/models/chatMessage';
import {
	DEFENCE_CONFIG_ITEM_ID,
	DEFENCE_ID,
	Defence,
} from '@src/models/defence';
import { EmailInfo } from '@src/models/email';
import { LEVEL_NAMES } from '@src/models/level';

jest.mock('@src/defence');

function responseMock() {
	return {
		send: jest.fn(),
		status: jest.fn().mockReturnThis(),
	} as unknown as Response;
}

describe('handleDefenceActivation', () => {
	test('WHEN passed sensible parameters THEN activates defence', () => {
		const mockActivateDefence = activateDefence as jest.MockedFunction<
			typeof activateDefence
		>;

		const req = {
			body: {
				defenceId: DEFENCE_ID.PROMPT_EVALUATION_LLM,
				level: LEVEL_NAMES.SANDBOX,
			},
			session: {
				levelState: [
					{},
					{},
					{},
					{
						level: LEVEL_NAMES.SANDBOX,
						defences: [
							{
								id: DEFENCE_ID.PROMPT_EVALUATION_LLM,
								isActive: false,
								config: [],
							},
						] as Defence[],
					},
				],
			},
		} as DefenceActivateRequest;

		const configuredDefences: Defence[] = [
			{
				id: 'PROMPT_EVALUATION_LLM',
				config: [],
				isActive: true,
			} as Defence,
		];
		mockActivateDefence.mockReturnValueOnce(configuredDefences);

		handleDefenceActivation(req, responseMock());

		expect(mockActivateDefence).toHaveBeenCalledTimes(1);
		expect(mockActivateDefence).toHaveBeenCalledWith(
			DEFENCE_ID.PROMPT_EVALUATION_LLM,
			[
				{
					id: DEFENCE_ID.PROMPT_EVALUATION_LLM,
					isActive: false,
					config: [],
				} as Defence,
			]
		);
		expect(req.session.levelState[LEVEL_NAMES.SANDBOX].defences).toEqual(
			configuredDefences
		);
	});

	test('WHEN missing defenceId THEN does not activate defence', () => {
		const req = {
			body: {
				level: LEVEL_NAMES.SANDBOX,
			},
		} as DefenceActivateRequest;

		const res = responseMock();

		handleDefenceActivation(req, res);

		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.send).toHaveBeenCalledWith('Missing defenceId');
	});

	test('WHEN missing level THEN does not activate defence', () => {
		const req = {
			body: {
				defenceId: DEFENCE_ID.PROMPT_EVALUATION_LLM,
			},
		} as DefenceActivateRequest;

		const res = responseMock();

		handleDefenceActivation(req, res);

		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.send).toHaveBeenCalledWith('Missing level');
	});

	test('WHEN level is invalid THEN does not activate defence', () => {
		const req = {
			body: {
				defenceId: DEFENCE_ID.PROMPT_EVALUATION_LLM,
				level: 5 as LEVEL_NAMES,
			},
		} as DefenceActivateRequest;

		const res = responseMock();

		handleDefenceActivation(req, res);

		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.send).toHaveBeenCalledWith('Invalid level');
	});

	test('WHEN level does not have configurable defences THEN does not activate defence', () => {
		const req = {
			body: {
				defenceId: DEFENCE_ID.PROMPT_EVALUATION_LLM,
				level: LEVEL_NAMES.LEVEL_1,
			},
			session: {
				levelState: [
					{
						level: LEVEL_NAMES.LEVEL_1,
						defences: undefined,
					},
				],
			},
		} as DefenceActivateRequest;

		const res = responseMock();

		handleDefenceActivation(req, res);

		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.send).toHaveBeenCalledWith(
			'You cannot activate defences on this level, because it uses the default defences'
		);
	});

	test('WHEN defence does not exist THEN does not activate defence', () => {
		const req = {
			body: {
				defenceId: 'badDefenceID' as DEFENCE_ID,
				level: LEVEL_NAMES.SANDBOX,
			},
			session: {
				levelState: [
					{},
					{},
					{},
					{
						level: LEVEL_NAMES.SANDBOX,
						defences: [
							{
								id: DEFENCE_ID.PROMPT_EVALUATION_LLM,
								isActive: true,
								config: [],
							},
						] as Defence[],
					},
				],
			},
		} as DefenceActivateRequest;

		const res = responseMock();

		handleDefenceActivation(req, res);

		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.send).toHaveBeenCalledWith(
			'Defence with id badDefenceID not found'
		);
	});
});

describe('handleDefenceDeactivation', () => {
	test('WHEN passed sensible parameters THEN deactivates defence', () => {
		const mockDeactivateDefence = deactivateDefence as jest.MockedFunction<
			typeof deactivateDefence
		>;

		const req = {
			body: {
				defenceId: DEFENCE_ID.PROMPT_EVALUATION_LLM,
				level: LEVEL_NAMES.SANDBOX,
			},
			session: {
				levelState: [
					{},
					{},
					{},
					{
						level: LEVEL_NAMES.SANDBOX,
						defences: [
							{
								id: DEFENCE_ID.PROMPT_EVALUATION_LLM,
								isActive: true,
								config: [],
							},
						] as Defence[],
					},
				],
			},
		} as DefenceActivateRequest;

		const configuredDefences: Defence[] = [
			{
				id: 'PROMPT_EVALUATION_LLM',
				config: [],
				isActive: false,
			} as Defence,
		];
		mockDeactivateDefence.mockReturnValueOnce(configuredDefences);

		handleDefenceDeactivation(req, responseMock());

		expect(mockDeactivateDefence).toHaveBeenCalledTimes(1);
		expect(mockDeactivateDefence).toHaveBeenCalledWith(
			DEFENCE_ID.PROMPT_EVALUATION_LLM,
			[
				{
					id: DEFENCE_ID.PROMPT_EVALUATION_LLM,
					isActive: true,
					config: [],
				} as Defence,
			]
		);
		expect(req.session.levelState[LEVEL_NAMES.SANDBOX].defences).toEqual(
			configuredDefences
		);
	});

	test('WHEN missing defenceId THEN does not deactivate defence', () => {
		const req = {
			body: {
				level: LEVEL_NAMES.SANDBOX,
			},
		} as DefenceActivateRequest;

		const res = responseMock();

		handleDefenceDeactivation(req, res);

		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.send).toHaveBeenCalledWith('Missing defenceId');
	});

	test('WHEN missing level THEN does not deactivate defence', () => {
		const req = {
			body: {
				defenceId: DEFENCE_ID.PROMPT_EVALUATION_LLM,
			},
		} as DefenceActivateRequest;

		const res = responseMock();

		handleDefenceDeactivation(req, res);

		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.send).toHaveBeenCalledWith('Missing level');
	});

	test('WHEN level is invalid THEN does not deactivate defence', () => {
		const req = {
			body: {
				defenceId: DEFENCE_ID.PROMPT_EVALUATION_LLM,
				level: 5 as LEVEL_NAMES,
			},
		} as DefenceActivateRequest;

		const res = responseMock();

		handleDefenceDeactivation(req, res);

		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.send).toHaveBeenCalledWith('Invalid level');
	});

	test('WHEN level does not have configurable defences THEN does not deactivate defence', () => {
		const req = {
			body: {
				defenceId: DEFENCE_ID.PROMPT_EVALUATION_LLM,
				level: LEVEL_NAMES.LEVEL_1,
			},
			session: {
				levelState: [
					{
						level: LEVEL_NAMES.LEVEL_1,
						defences: undefined,
					},
				],
			},
		} as DefenceActivateRequest;

		const res = responseMock();

		handleDefenceDeactivation(req, res);

		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.send).toHaveBeenCalledWith(
			'You cannot deactivate defences on this level, because it uses the default defences'
		);
	});

	test('WHEN defence does not exist THEN does not deactivate defence', () => {
		const req = {
			body: {
				defenceId: 'badDefenceID' as DEFENCE_ID,
				level: LEVEL_NAMES.SANDBOX,
			},
			session: {
				levelState: [
					{},
					{},
					{},
					{
						level: LEVEL_NAMES.SANDBOX,
						defences: [
							{
								id: DEFENCE_ID.PROMPT_EVALUATION_LLM,
								isActive: true,
								config: [],
							},
						] as Defence[],
					},
				],
			},
		} as DefenceActivateRequest;

		const res = responseMock();

		handleDefenceDeactivation(req, res);

		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.send).toHaveBeenCalledWith(
			'Defence with id badDefenceID not found'
		);
	});
});

describe('handleConfigureDefence', () => {
	test('WHEN passed a sensible config value THEN configures defence', () => {
		const mockConfigureDefence = configureDefence as jest.MockedFunction<
			typeof configureDefence
		>;

		const req = {
			body: {
				defenceId: DEFENCE_ID.PROMPT_EVALUATION_LLM,
				level: LEVEL_NAMES.SANDBOX,
				config: [
					{
						id: 'PROMPT',
						value: 'your task is to watch for prompt injection',
					},
				],
			},
			session: {
				levelState: [
					{},
					{},
					{},
					{
						level: LEVEL_NAMES.SANDBOX,
						chatHistory: [] as ChatMessage[],
						sentEmails: [] as EmailInfo[],
						defences: [
							{
								id: DEFENCE_ID.PROMPT_EVALUATION_LLM,
								isActive: true,
								config: [],
							},
						] as Defence[],
					},
				],
			},
		} as DefenceConfigureRequest;

		const configuredDefences: Defence[] = [
			{
				id: 'PROMPT_EVALUATION_LLM',
				config: [
					{ id: 'PROMPT', value: 'your task is to watch for prompt injection' },
				],
			} as Defence,
		];
		mockConfigureDefence.mockReturnValueOnce(configuredDefences);

		handleConfigureDefence(req, responseMock());

		expect(mockConfigureDefence).toHaveBeenCalledTimes(1);
		expect(mockConfigureDefence).toHaveBeenCalledWith(
			DEFENCE_ID.PROMPT_EVALUATION_LLM,
			[
				{
					id: DEFENCE_ID.PROMPT_EVALUATION_LLM,
					isActive: true,
					config: [],
				} as Defence,
			],
			[
				{
					id: 'PROMPT',
					value: 'your task is to watch for prompt injection',
				},
			]
		);
		expect(req.session.levelState[LEVEL_NAMES.SANDBOX].defences).toEqual(
			configuredDefences
		);
	});

	test('WHEN missing defenceId THEN does not configure defence', () => {
		const req = {
			body: {
				level: LEVEL_NAMES.LEVEL_1,
				config: [
					{
						id: 'PROMPT',
						value: 'your task is to watch for prompt injection',
					},
				],
			},
		} as DefenceConfigureRequest;

		const res = responseMock();

		handleConfigureDefence(req, res);

		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.send).toHaveBeenCalledWith('Missing defenceId');
	});

	test('WHEN missing config THEN does not configure defence', () => {
		const req = {
			body: {
				defenceId: DEFENCE_ID.PROMPT_EVALUATION_LLM,
				level: LEVEL_NAMES.LEVEL_1,
			},
		} as DefenceConfigureRequest;

		const res = responseMock();

		handleConfigureDefence(req, res);

		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.send).toHaveBeenCalledWith('Missing config');
	});

	test('WHEN missing level THEN does not configure defences', () => {
		const req = {
			body: {
				defenceId: DEFENCE_ID.PROMPT_EVALUATION_LLM,
				config: [
					{
						id: 'PROMPT',
						value: 'your task is to watch for prompt injection',
					},
				],
			},
		} as DefenceConfigureRequest;

		const res = responseMock();

		handleConfigureDefence(req, res);

		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.send).toHaveBeenCalledWith('Missing level');
	});

	test('WHEN level is invalid THEN does not configure defence', () => {
		const req = {
			body: {
				defenceId: DEFENCE_ID.PROMPT_EVALUATION_LLM,
				config: [
					{
						id: 'PROMPT',
						value: 'your task is to watch for prompt injection',
					},
				],
				level: -1 as LEVEL_NAMES,
			},
		} as DefenceConfigureRequest;

		const res = responseMock();

		handleConfigureDefence(req, res);

		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.send).toHaveBeenCalledWith('Invalid level');
	});

	test('WHEN config value exceeds character limit THEN does not configure defence', () => {
		const CHARACTER_LIMIT = 5000;
		const longConfigValue = 'a'.repeat(CHARACTER_LIMIT + 1);

		const req = {
			body: {
				defenceId: DEFENCE_ID.PROMPT_EVALUATION_LLM,
				level: LEVEL_NAMES.LEVEL_1,
				config: [
					{
						id: 'PROMPT',
						value: longConfigValue,
					},
				],
			},
		} as DefenceConfigureRequest;

		const res = responseMock();

		handleConfigureDefence(req, res);

		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.send).toHaveBeenCalledWith(
			'Config value exceeds character limit'
		);
	});

	test('WHEN level does not have configurable defences THEN does not configure defence', () => {
		const req = {
			body: {
				defenceId: DEFENCE_ID.PROMPT_EVALUATION_LLM,
				config: [
					{
						id: 'PROMPT',
						value: 'your task is to watch for prompt injection',
					},
				],
				level: LEVEL_NAMES.LEVEL_1,
			},
			session: {
				levelState: [
					{
						level: LEVEL_NAMES.LEVEL_1,
						chatHistory: [] as ChatMessage[],
						sentEmails: [] as EmailInfo[],
						defences: undefined,
					},
				],
			},
		} as DefenceConfigureRequest;

		const res = responseMock();

		handleConfigureDefence(req, res);

		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.send).toHaveBeenCalledWith(
			'You cannot configure defences on this level, because it uses the default defences'
		);
	});

	test('WHEN defence does not exist THEN does not configure defences', () => {
		const req = {
			body: {
				defenceId: 'badDefenceID' as DEFENCE_ID,
				config: [
					{
						id: 'PROMPT',
						value: 'your task is to watch for prompt injection',
					},
				],
				level: LEVEL_NAMES.SANDBOX,
			},
			session: {
				levelState: [
					{},
					{},
					{},
					{
						level: LEVEL_NAMES.SANDBOX,
						chatHistory: [] as ChatMessage[],
						sentEmails: [] as EmailInfo[],
						defences: [] as Defence[],
					},
				],
			},
		} as DefenceConfigureRequest;

		const res = responseMock();

		handleConfigureDefence(req, res);

		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.send).toHaveBeenCalledWith(
			`Defence with id badDefenceID not found`
		);
	});
});

describe('handleResetDefenceConfigItem', () => {
	test('WHEN passed sensible parameters THEN resets config item', () => {
		const mockResetDefenceConfig = resetDefenceConfig as jest.MockedFunction<
			typeof resetDefenceConfig
		>;

		const req = {
			body: {
				defenceId: DEFENCE_ID.PROMPT_EVALUATION_LLM,
				configItemId: 'PROMPT',
				level: LEVEL_NAMES.SANDBOX,
			},
			session: {
				levelState: [
					{},
					{},
					{},
					{
						level: LEVEL_NAMES.SANDBOX,
						chatHistory: [] as ChatMessage[],
						sentEmails: [] as EmailInfo[],
						defences: [
							{
								id: DEFENCE_ID.PROMPT_EVALUATION_LLM,
								isActive: true,
								config: [{ id: 'PROMPT', value: 'old value' }],
							},
						] as Defence[],
					},
				],
			},
		} as DefenceConfigItemResetRequest;

		const configuredDefences: Defence[] = [
			{
				id: 'PROMPT_EVALUATION_LLM',
				config: [{ id: 'PROMPT', value: 'reset value' }],
			} as Defence,
		];
		mockResetDefenceConfig.mockReturnValueOnce(configuredDefences);

		handleResetDefenceConfigItem(req, responseMock());

		expect(mockResetDefenceConfig).toHaveBeenCalledTimes(1);
		expect(mockResetDefenceConfig).toHaveBeenCalledWith(
			DEFENCE_ID.PROMPT_EVALUATION_LLM,
			'PROMPT',
			[
				{
					id: DEFENCE_ID.PROMPT_EVALUATION_LLM,
					isActive: true,
					config: [{ id: 'PROMPT', value: 'old value' }],
				} as Defence,
			]
		);
		expect(req.session.levelState[LEVEL_NAMES.SANDBOX].defences).toEqual(
			configuredDefences
		);
	});

	test('WHEN missing defenceId THEN does not reset config item', () => {
		const req = {
			body: {
				configItemId: 'PROMPT',
				level: LEVEL_NAMES.SANDBOX,
			},
		} as DefenceConfigItemResetRequest;

		const res = responseMock();

		handleResetDefenceConfigItem(req, res);

		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.send).toHaveBeenCalledWith('Missing defenceId');
	});

	test('WHEN missing config item id THEN does not reset config item', () => {
		const req = {
			body: {
				defenceId: DEFENCE_ID.PROMPT_EVALUATION_LLM,
				level: LEVEL_NAMES.SANDBOX,
			},
		} as DefenceConfigItemResetRequest;

		const res = responseMock();

		handleResetDefenceConfigItem(req, res);

		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.send).toHaveBeenCalledWith('Missing configId');
	});

	test('WHEN missing level THEN does not reset config item', () => {
		const req = {
			body: {
				defenceId: DEFENCE_ID.PROMPT_EVALUATION_LLM,
				configItemId: 'PROMPT',
			},
		} as DefenceConfigItemResetRequest;

		const res = responseMock();

		handleResetDefenceConfigItem(req, res);

		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.send).toHaveBeenCalledWith('Missing level');
	});

	test('WHEN invalid level THEN does not reset config item', () => {
		const req = {
			body: {
				defenceId: DEFENCE_ID.PROMPT_EVALUATION_LLM,
				configItemId: 'PROMPT',
				level: 5 as LEVEL_NAMES,
			},
		} as DefenceConfigItemResetRequest;

		const res = responseMock();

		handleResetDefenceConfigItem(req, res);

		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.send).toHaveBeenCalledWith('Invalid level');
	});

	test('WHEN defence does not exist THEN does not reset config item', () => {
		const req = {
			body: {
				defenceId: 'badDefenceID' as DEFENCE_ID,
				configItemId: 'PROMPT',
				level: LEVEL_NAMES.SANDBOX,
			},
			session: {
				levelState: [
					{},
					{},
					{},
					{
						level: LEVEL_NAMES.SANDBOX,
						defences: [] as Defence[],
					},
				],
			},
		} as DefenceConfigItemResetRequest;

		const res = responseMock();

		handleResetDefenceConfigItem(req, res);

		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.send).toHaveBeenCalledWith(
			`Defence with id badDefenceID not found`
		);
	});

	test('WHEN config item id does not exist for given defence THEN does not reset config item', () => {
		const req = {
			body: {
				defenceId: DEFENCE_ID.PROMPT_EVALUATION_LLM,
				configItemId: 'badConfigItemId' as DEFENCE_CONFIG_ITEM_ID,
				level: LEVEL_NAMES.SANDBOX,
			},
			session: {
				levelState: [
					{},
					{},
					{},
					{
						level: LEVEL_NAMES.SANDBOX,
						defences: [
							{
								id: DEFENCE_ID.PROMPT_EVALUATION_LLM,
								isActive: true,
								config: [{ id: 'PROMPT', value: 'old value' }],
							},
						] as Defence[],
					},
				],
			},
		} as DefenceConfigItemResetRequest;

		const res = responseMock();

		handleResetDefenceConfigItem(req, res);

		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.send).toHaveBeenCalledWith(
			`Config item with id badConfigItemId not found for defence with id ${DEFENCE_ID.PROMPT_EVALUATION_LLM}`
		);
	});
});

describe('handleGetDefenceStatus', () => {
	test('WHEN passed sensible parameters THEN gets defence status', () => {
		const req = {
			query: {
				level: LEVEL_NAMES.SANDBOX,
			},
			session: {
				levelState: [
					{},
					{},
					{},
					{
						level: LEVEL_NAMES.SANDBOX,
						chatHistory: [] as ChatMessage[],
						sentEmails: [] as EmailInfo[],
						defences: [
							{
								id: DEFENCE_ID.PROMPT_EVALUATION_LLM,
								isActive: true,
								config: [{ id: 'PROMPT', value: 'old value' }],
							},
						] as Defence[],
					},
				],
			},
		} as DefenceStatusRequest;

		const res = responseMock();

		handleGetDefenceStatus(req, res);

		expect(res.send).toHaveBeenCalledWith([
			{
				id: DEFENCE_ID.PROMPT_EVALUATION_LLM,
				isActive: true,
				config: [{ id: 'PROMPT', value: 'old value' }],
			},
		]);
	});

	test('WHEN missing level THEN does not get defence status', () => {
		const req = {
			query: {},
		} as DefenceStatusRequest;

		const res = responseMock();

		handleGetDefenceStatus(req, res);

		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.send).toHaveBeenCalledWith(`Missing level`);
	});

	test('WHEN invalid level THEN does not get defence status', () => {
		const req = {
			query: { level: 5 as LEVEL_NAMES },
		} as DefenceStatusRequest;

		const res = responseMock();

		handleGetDefenceStatus(req, res);

		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.send).toHaveBeenCalledWith(`Invalid level`);
	});
});
