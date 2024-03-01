import { expect, test, jest, afterEach } from '@jest/globals';
import { Response } from 'express';

import { handleStart } from '@src/controller/startController';
import { StartGetRequest } from '@src/models/api/StartGetRequest';

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

test('GIVEN level 1 provided WHEN user starts the frontend THEN the backend sends the initial information', () => {
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
			systemRoles: [],
		},
	} as unknown as StartGetRequest;
	const res = responseMock();

	handleStart(req, res);

	expect(mockSend).toHaveBeenCalledWith({
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
