import { expect, test, jest, afterEach } from '@jest/globals';
import { Response } from 'express';

import { handleStart } from '@src/controller/startController';
import { StartGetRequest } from '@src/models/api/StartGetRequest';
import { LEVEL_NAMES } from '@src/models/level';

jest.mock('@src/promptTemplates', () => ({
	systemRoleLevel1: 'systemRoleLevel1',
	systemRoleLevel2: 'systemRoleLevel2',
	systemRoleLevel3: 'systemRoleLevel3',
}));

const mockSend = jest.fn();

function responseMock() {
	return {
		send: mockSend,
		status: jest.fn().mockReturnValue({ send: mockSend }),
	} as unknown as Response;
}

afterEach(() => {
	mockSend.mockClear();
});

test.each(Object.values(LEVEL_NAMES))(
	`GIVEN level [%s] provided WHEN user starts the frontend THEN the backend sends the correct initial information`,
	(level) => {
		const req = {
			query: {
				level,
			},
			session: {
				levelState: [
					{
						sentEmails: 'level 1 emails',
						chatHistory: 'level 1 chat history',
						defences: 'level 1 defences',
					},
					{
						sentEmails: 'level 2 emails',
						chatHistory: 'level 2 chat history',
						defences: 'level 2 defences',
					},
					{
						sentEmails: 'level 3 emails',
						chatHistory: 'level 3 chat history',
						defences: 'level 3 defences',
					},
					{
						sentEmails: 'level 4 emails',
						chatHistory: 'level 4 chat history',
						defences: 'level 4 defences',
					},
				],
				chatModel: 'chat model',
				systemRoles: [],
			},
		} as unknown as StartGetRequest;
		const res = responseMock();

		handleStart(req, res);

		expect(mockSend).toHaveBeenCalledWith({
			emails: `level ${level + 1} emails`,
			chatHistory: `level ${level + 1} chat history`,
			defences: `level ${level + 1} defences`,
			availableModels: [],
			systemRoles: [
				{ level: 0, systemRole: 'systemRoleLevel1' },
				{ level: 1, systemRole: 'systemRoleLevel2' },
				{ level: 2, systemRole: 'systemRoleLevel3' },
			],
			chatModel: level === LEVEL_NAMES.SANDBOX ? 'chat model' : undefined,
		});
	}
);

test('GIVEN no level provided WHEN user starts the frontend THEN the backend responds with error message', () => {
	const req = {
		query: {},
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

	expect(res.status).toHaveBeenCalledWith(400);
	expect(mockSend).toHaveBeenCalledWith('Level not provided');
});

test('GIVEN invalid level provided WHEN user starts the frontend THEN the backend responds with error message', () => {
	const req = {
		query: { level: 5 },
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

	expect(res.status).toHaveBeenCalledWith(400);
	expect(mockSend).toHaveBeenCalledWith('Invalid level');
});
