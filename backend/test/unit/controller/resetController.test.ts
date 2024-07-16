import { expect, test, jest, afterEach, describe } from '@jest/globals';
import { Response } from 'express';

import {
	handleResetLevel,
	handleResetProgress,
} from '@src/controller/resetController';
import { defaultDefences } from '@src/defaultDefences';
import {
	LevelResetRequest,
	LevelResetResponseBody,
} from '@src/models/api/LevelResetRequest';
import {
	ProgressResetRequest,
	ProgressResetResponseBody,
} from '@src/models/api/ProgressResetRequest';
import { defaultChatModel } from '@src/models/chat';
import { DocumentMeta } from '@src/models/document';
import { LEVEL_NAMES } from '@src/models/level';

const mockDocuments = [
	{
		fileName: 'any-file.txt',
		fileType: 'txt',
		folder: 'anyfolder',
	} as DocumentMeta,
];

jest.mock('@src/document', () => ({
	getSandboxDocumentMetas: () => mockDocuments,
}));

const mockSend = jest.fn();

function responseMock<ResBody>() {
	return {
		send: mockSend,
		status: jest.fn().mockReturnValue({ send: mockSend }),
	} as unknown as Response<ResBody>;
}

afterEach(() => {
	mockSend.mockClear();
});

describe('reset progress', () => {
	const mockGetInitialLevelStates = jest.fn();

	jest.mock('@src/models/level', () => {
		const originalModule =
			jest.requireActual<typeof import('@src/models/level')>(
				'@src/models/level'
			);
		return {
			...originalModule,
			getInitialLevelStates: () => mockGetInitialLevelStates(),
		};
	});

	jest.mock('@src/defaultDefences', () => ({
		defaultDefences: 'DEFAULT_DEFENCES',
	}));

	jest.mock('@src/models/chat', () => ({
		defaultChatModel: 'DEFAULT_CHAT_MODEL',
	}));

	test.each(Object.values(LEVEL_NAMES))(
		`GIVEN level [%s] WHEN client asks to reset all progress THEN game state is cleared AND the backend sends the correct level information`,
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
				},
			} as unknown as ProgressResetRequest;
			const res = responseMock<ProgressResetResponseBody>();

			mockGetInitialLevelStates.mockReturnValue([
				{
					sentEmails: [],
					chatHistory: [],
					defences: undefined,
				},
				{
					sentEmails: [],
					chatHistory: [],
					defences: undefined,
				},
				{
					sentEmails: [],
					chatHistory: [],
					defences: defaultDefences,
				},
				{
					sentEmails: [],
					chatHistory: [],
					defences: defaultDefences,
				},
			]);

			handleResetProgress(req, res);

			expect(mockSend).toHaveBeenCalledWith({
				emails: [],
				chatHistory: [],
				defences:
					level === LEVEL_NAMES.LEVEL_1 || level === LEVEL_NAMES.LEVEL_2
						? undefined
						: defaultDefences,
				chatModel: level === LEVEL_NAMES.SANDBOX ? defaultChatModel : undefined,
				availableDocs:
					level === LEVEL_NAMES.SANDBOX ? mockDocuments : undefined,
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
		} as unknown as ProgressResetRequest;
		const res = responseMock<ProgressResetResponseBody>();

		handleResetProgress(req, res);

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
		} as unknown as ProgressResetRequest;
		const res = responseMock<ProgressResetResponseBody>();

		handleResetProgress(req, res);

		expect(res.status).toHaveBeenCalledWith(400);
		expect(mockSend).toHaveBeenCalledWith('Invalid level');
	});
});

describe('reset level', () => {
	test.each(Object.values(LEVEL_NAMES))(
		`GIVEN level [%s] WHEN client asks to reset level progress THEN sent messages and emails are cleared AND the backend sends an info message`,
		(level) => {
			const req = {
				params: {
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
				},
			} as unknown as LevelResetRequest;
			const res = responseMock<LevelResetResponseBody>();

			handleResetLevel(req, res);

			expect(req.session.levelState[level].chatHistory).toEqual([]);
			expect(req.session.levelState[level].sentEmails).toEqual([]);

			expect(mockSend).toHaveBeenCalledWith({
				chatInfoMessage: {
					infoMessage: 'Level progress reset',
					chatMessageType: 'RESET_LEVEL',
				},
			});
		}
	);

	test('WHEN client provides an invalid level THEN the backend responds with BadRequest', () => {
		const req = {
			params: { level: 5 },
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
		} as unknown as LevelResetRequest;
		const res = responseMock<LevelResetResponseBody>();

		handleResetLevel(req, res);

		expect(res.status).toHaveBeenCalledWith(400);
		expect(mockSend).toHaveBeenCalledWith('Invalid level');
	});
});
