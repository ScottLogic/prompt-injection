import { expect, test, jest, afterEach } from '@jest/globals';
import { Response } from 'express';

import { handleLoadLevel } from '@src/controller/levelController';
import { LevelGetRequest } from '@src/models/api/LevelGetRequest';
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
	`GIVEN level [%s] WHEN client asks to load the level THEN the backend sends the correct level information`,
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
			},
		} as unknown as LevelGetRequest;
		const res = responseMock();

		handleLoadLevel(req, res);

		expect(mockSend).toHaveBeenCalledWith({
			emails: `level ${level + 1} emails`,
			chatHistory: `level ${level + 1} chat history`,
			defences: `level ${level + 1} defences`,
		});
	}
);

test('WHEN client does not provide a level THEN the backend responds with BadRequest', () => {
	const req = {
		query: {},
		session: {
			levelState: [
				{},
				{
					sentEmails: [],
					chatHistory: [],
					defences: [],
				},
			],
		},
	} as unknown as LevelGetRequest;
	const res = responseMock();

	handleLoadLevel(req, res);

	expect(res.status).toHaveBeenCalledWith(400);
	expect(mockSend).toHaveBeenCalledWith('Level not provided');
});

test('WHEN client provides an invalid level THEN the backend responds with BadRequest', () => {
	const req = {
		query: { level: 5 },
		session: {
			levelState: [
				{},
				{
					sentEmails: [],
					chatHistory: [],
					defences: [],
				},
			],
		},
	} as unknown as LevelGetRequest;
	const res = responseMock();

	handleLoadLevel(req, res);

	expect(res.status).toHaveBeenCalledWith(400);
	expect(mockSend).toHaveBeenCalledWith('Invalid level');
});
