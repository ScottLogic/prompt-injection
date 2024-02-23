import { expect, test, jest } from '@jest/globals';
import { Response } from 'express';

import { handleStart } from '@src/controller/startController';
import { StartGetRequest } from '@src/models/api/StartGetRequest';
import { ChatModel } from '@src/models/chat';
import { ChatMessage } from '@src/models/chatMessage';
import { Defence } from '@src/models/defence';
import { EmailInfo } from '@src/models/email';
import { LEVEL_NAMES } from '@src/models/level';

declare module 'express-session' {
	interface Session {
		initialised: boolean;
		chatModel: ChatModel;
		levelState: LevelState[];
	}
	interface LevelState {
		level: LEVEL_NAMES;
		chatHistory: ChatMessage[];
		defences: Defence[];
		sentEmails: EmailInfo[];
	}
}

jest.mock('@src/promptTemplates', () => ({
	systemRoleLevel1: 'systemRoleLevel1',
	systemRoleLevel2: 'systemRoleLevel2',
	systemRoleLevel3: 'systemRoleLevel3',
}));

function responseMock() {
	return {
		send: jest.fn(),
		status: jest.fn(),
	} as unknown as Response;
}

test('dummy test', () => {
	const req = {
		query: {
			level: 0,
		},
		session: {
			levelState: [
				{
					sentEmails: [],
					chatHistory: [],
					defences: [],
				},
			],
			systemRoles: [],
		},
	} as unknown as StartGetRequest;
	const res = responseMock();

	handleStart(req, res);

	expect(res.send).toHaveBeenCalledWith({
		emails: [],
		chatHistory: [],
		defences: [],
		availableModels: [],
		systemRoles: [
			{ level: 0, systemRole: 'systemRoleLevel1' },
			{ level: 1, systemRole: 'systemRoleLevel2' },
			{ level: 2, systemRole: 'systemRoleLevel3' },
		],
	});
});
