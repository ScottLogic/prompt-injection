import { expect, test, jest, afterEach } from '@jest/globals';
import { Response } from 'express';

import { handleLoadLevel } from '@src/controller/levelController';
import { LevelGetRequest } from '@src/models/api/LevelGetRequest';

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

test('WHEN client asks to load level 1 THEN the backend sends the level information for the given level', () => {
	const req = {
		query: {
			level: 1,
		},
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

	expect(mockSend).toHaveBeenCalledWith({
		emails: [],
		chatHistory: [],
		defences: [],
	});
});

test('WHEN client does not provide a level THEN the backend sends the level information for the given level', () => {
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
