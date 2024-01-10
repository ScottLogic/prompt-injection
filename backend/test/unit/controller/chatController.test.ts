/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/unbound-method */
import { Response } from 'express';

import {
	handleAddToChatHistory,
	handleChatToGPT,
	handleClearChatHistory,
	handleGetChatHistory,
} from '@src/controller/chatController';
import { detectTriggeredInputDefences } from '@src/defence';
import { OpenAiAddHistoryRequest } from '@src/models/api/OpenAiAddHistoryRequest';
import { OpenAiChatRequest } from '@src/models/api/OpenAiChatRequest';
import { OpenAiClearRequest } from '@src/models/api/OpenAiClearRequest';
import { OpenAiGetHistoryRequest } from '@src/models/api/OpenAiGetHistoryRequest';
import {
	CHAT_MESSAGE_TYPE,
	ChatDefenceReport,
	ChatHistoryMessage,
	ChatModel,
} from '@src/models/chat';
import { DEFENCE_ID, Defence } from '@src/models/defence';
import { EmailInfo } from '@src/models/email';
import { LEVEL_NAMES, LevelState } from '@src/models/level';

declare module 'express-session' {
	interface Session {
		initialised: boolean;
		chatModel: ChatModel;
		levelState: LevelState[];
	}
	interface LevelState {
		level: LEVEL_NAMES;
		chatHistory: ChatHistoryMessage[];
		defences: Defence[];
		sentEmails: EmailInfo[];
	}
}

// mock the api call
const mockCreateChatCompletion = jest.fn();
jest.mock('openai', () => ({
	OpenAI: jest.fn().mockImplementation(() => ({
		chat: {
			completions: {
				create: mockCreateChatCompletion,
			},
		},
	})),
}));

// const mockDetectTriggeredDefences = jest.fn();
// jest.mock('@src/defence', () => {
// 	// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
// 	const originalModule = jest.requireActual('@src/defence');
// 	// eslint-disable-next-line @typescript-eslint/no-unsafe-return
// 	return {
// 		...originalModule,
// 		detectTriggeredInputDefences: () => {
// 			mockDetectTriggeredDefences();
// 		},
// 	};
// });

jest.mock('@src/defence');
const mockDetectTriggeredDefences =
	detectTriggeredInputDefences as jest.MockedFunction<
		typeof detectTriggeredInputDefences
	>;

function responseMock() {
	return {
		send: jest.fn(),
		status: jest.fn().mockReturnThis(),
	} as unknown as Response;
}

describe('handleChatToGPT unit tests', () => {
	function errorResponseMock(
		message: string,
		{
			transformedMessage,
			openAIErrorMessage,
		}: { transformedMessage?: string; openAIErrorMessage?: string }
	) {
		return {
			reply: message,
			defenceReport: {
				blockedReason: message,
				isBlocked: true,
				alertedDefences: [],
				triggeredDefences: [],
			},
			transformedMessage: transformedMessage ?? undefined,
			wonLevel: false,
			isError: true,
			sentEmails: [],
			openAIErrorMessage: openAIErrorMessage ?? null,
		};
	}

	function openAiChatRequestMock(
		message?: string,
		level?: LEVEL_NAMES,
		chatHistory: ChatHistoryMessage[] = [],
		sentEmails: EmailInfo[] = [],
		defences: Defence[] = []
	): OpenAiChatRequest {
		const emptyLevelStatesUpToChosenLevel = level
			? [0, 1, 2, 3]
					.filter((levelNum) => levelNum < level.valueOf())
					.map(
						(levelNum) =>
							({
								level: levelNum,
								chatHistory: [],
								sentEmails: [],
								defences: [],
							} as LevelState)
					)
			: [];
		return {
			body: {
				currentLevel: level ?? undefined,
				message: message ?? '',
			},
			session: {
				levelState: [
					...emptyLevelStatesUpToChosenLevel,
					{
						level: level ?? undefined,
						chatHistory,
						sentEmails,
						defences,
					},
				],
			},
		} as OpenAiChatRequest;
	}

	test('GIVEN missing message WHEN handleChatToGPT called THEN it should return 400 and error message', async () => {
		const req = openAiChatRequestMock('', LEVEL_NAMES.LEVEL_1);
		const res = responseMock();
		await handleChatToGPT(req, res);

		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.send).toHaveBeenCalledWith(
			errorResponseMock('Missing or empty message or level', {})
		);
	});

	test('GIVEN message exceeds input character limit (not a defence) WHEN handleChatToGPT called THEN it should return 400 and error message', async () => {
		const req = openAiChatRequestMock('x'.repeat(16399), 0);
		const res = responseMock();

		await handleChatToGPT(req, res);

		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.send).toHaveBeenCalledWith(
			errorResponseMock('Message exceeds character limit', {})
		);
	});

	describe('defence triggered', () => {
		function triggeredDefencesMockReturn(
			blockedReason: string,
			triggeredDefence: DEFENCE_ID
		): Promise<ChatDefenceReport> {
			return new Promise((resolve, reject) => {
				try {
					resolve({
						blockedReason,
						isBlocked: true,
						alertedDefences: [],
						triggeredDefences: [triggeredDefence],
					} as ChatDefenceReport);
				} catch (err) {
					reject(err);
				}
			});
		}

		test('GIVEN character limit defence active AND message exceeds character limit WHEN handleChatToGPT called THEN it should return 200 and blocked reason', async () => {
			const req = openAiChatRequestMock('hey', LEVEL_NAMES.SANDBOX);
			const res = responseMock();

			mockDetectTriggeredDefences.mockReturnValueOnce(
				triggeredDefencesMockReturn(
					'Message Blocked: Input exceeded character limit.',
					DEFENCE_ID.CHARACTER_LIMIT
				)
			);

			await handleChatToGPT(req, res);

			expect(res.status).not.toHaveBeenCalled();
			expect(res.send).toHaveBeenCalledWith(
				expect.objectContaining({
					defenceReport: {
						alertedDefences: [],
						blockedReason: 'Message Blocked: Input exceeded character limit.',
						isBlocked: true,
						triggeredDefences: [DEFENCE_ID.CHARACTER_LIMIT],
					},
					reply: '',
				})
			);
		});

		test('GIVEN filter user input defence enabled AND message contains filtered word WHEN handleChatToGPT called THEN it should return 200 and blocked reason', async () => {
			const req = openAiChatRequestMock('hey', LEVEL_NAMES.SANDBOX);
			const res = responseMock();

			mockDetectTriggeredDefences.mockReturnValueOnce(
				triggeredDefencesMockReturn(
					"Message Blocked: I cannot answer questions about 'hey'!",
					DEFENCE_ID.FILTER_USER_INPUT
				)
			);

			await handleChatToGPT(req, res);

			expect(res.status).not.toHaveBeenCalled();
			expect(res.send).toHaveBeenCalledWith(
				expect.objectContaining({
					defenceReport: {
						alertedDefences: [],
						blockedReason:
							"Message Blocked: I cannot answer questions about 'hey'!",
						isBlocked: true,
						triggeredDefences: [DEFENCE_ID.FILTER_USER_INPUT],
					},
					reply: '',
				})
			);
		});

		test('GIVEN message has xml tagging defence WHEN handleChatToGPT called THEN it should return 200 and blocked reason', async () => {
			const req = openAiChatRequestMock(
				'<input>hey</input>',
				LEVEL_NAMES.SANDBOX
			);
			const res = responseMock();

			mockDetectTriggeredDefences.mockReturnValueOnce(
				triggeredDefencesMockReturn(
					'Message Blocked: The prompt evaluation LLM detected a malicious input.',
					DEFENCE_ID.PROMPT_EVALUATION_LLM
				)
			);

			await handleChatToGPT(req, res);

			expect(res.status).not.toHaveBeenCalled();
			expect(res.send).toHaveBeenCalledWith(
				expect.objectContaining({
					defenceReport: {
						alertedDefences: [],
						blockedReason:
							'Message Blocked: The prompt evaluation LLM detected a malicious input.',
						isBlocked: true,
						triggeredDefences: [DEFENCE_ID.PROMPT_EVALUATION_LLM],
					},
					reply: '',
				})
			);
		});
	});
});

describe('handleGetChatHistory', () => {
	function getRequestMock(
		level?: LEVEL_NAMES,
		chatHistory?: ChatHistoryMessage[]
	) {
		return {
			query: {
				level: level ?? undefined,
			},
			session: {
				levelState: [
					{
						chatHistory: chatHistory ?? [],
					},
				],
			},
		} as OpenAiGetHistoryRequest;
	}

	const chatHistory: ChatHistoryMessage[] = [
		{
			completion: { role: 'system', content: 'You are a helpful chatbot' },
			chatMessageType: CHAT_MESSAGE_TYPE.SYSTEM,
		},
		{
			completion: { role: 'assistant', content: 'Hello human' },
			chatMessageType: CHAT_MESSAGE_TYPE.BOT,
		},
		{
			completion: { role: 'user', content: 'How are you?' },
			chatMessageType: CHAT_MESSAGE_TYPE.SYSTEM,
		},
	];
	test('GIVEN a valid level WHEN handleGetChatHistory called THEN return chat history', () => {
		const req = getRequestMock(LEVEL_NAMES.LEVEL_1, chatHistory);
		const res = responseMock();

		handleGetChatHistory(req, res);
		expect(res.send).toHaveBeenCalledWith(chatHistory);
	});

	test('GIVEN undefined level WHEN handleGetChatHistory called THEN return 400', () => {
		const req = getRequestMock();
		const res = responseMock();

		handleGetChatHistory(req, res);

		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.send).toHaveBeenCalledWith('Missing level');
	});
});

describe('handleAddToChatHistory', () => {
	function getAddHistoryRequestMock(
		message: string,
		level?: LEVEL_NAMES,
		chatHistory?: ChatHistoryMessage[]
	) {
		return {
			body: {
				message,
				chatMessageType: CHAT_MESSAGE_TYPE.USER,
				level: level ?? undefined,
			},
			session: {
				levelState: [
					{
						chatHistory: chatHistory ?? [],
					},
				],
			},
		} as OpenAiAddHistoryRequest;
	}

	const chatHistory: ChatHistoryMessage[] = [
		{
			completion: { role: 'system', content: 'You are a helpful chatbot' },
			chatMessageType: CHAT_MESSAGE_TYPE.SYSTEM,
		},
		{
			completion: { role: 'assistant', content: 'Hello human' },
			chatMessageType: CHAT_MESSAGE_TYPE.BOT,
		},
	];
	test('GIVEN a valid message WHEN handleAddToChatHistory called THEN message is added to chat history', () => {
		const req = getAddHistoryRequestMock(
			'tell me a story',
			LEVEL_NAMES.LEVEL_1,
			chatHistory
		);
		const res = responseMock();

		handleAddToChatHistory(req, res);

		expect(req.session.levelState[0].chatHistory.length).toEqual(3);
	});

	test('GIVEN invalid level WHEN handleAddToChatHistory called THEN returns 400', () => {
		const req = getAddHistoryRequestMock(
			'tell me a story',
			undefined,
			chatHistory
		);
		const res = responseMock();

		handleAddToChatHistory(req, res);

		expect(res.status).toHaveBeenCalledWith(400);
	});
});

describe('handleClearChatHistory', () => {
	function openAiClearRequestMock(
		level?: LEVEL_NAMES,
		chatHistory?: ChatHistoryMessage[]
	) {
		return {
			body: {
				level: level ?? undefined,
			},
			session: {
				levelState: [
					{
						chatHistory: chatHistory ?? [],
					},
				],
			},
		} as OpenAiClearRequest;
	}

	const chatHistory: ChatHistoryMessage[] = [
		{
			completion: { role: 'system', content: 'You are a helpful chatbot' },
			chatMessageType: CHAT_MESSAGE_TYPE.SYSTEM,
		},
		{
			completion: { role: 'assistant', content: 'Hello human' },
			chatMessageType: CHAT_MESSAGE_TYPE.BOT,
		},
	];
	test('GIVEN valid level WHEN handleClearChatHistory called THEN it sets chatHistory to empty', () => {
		const req = openAiClearRequestMock(LEVEL_NAMES.LEVEL_1, chatHistory);
		const res = responseMock();
		handleClearChatHistory(req, res);
		expect(req.session.levelState[0].chatHistory.length).toEqual(0);
	});

	test('GIVEN invalid level WHEN handleClearChatHistory called THEN returns 400 ', () => {
		const req = openAiClearRequestMock(undefined, chatHistory);

		const res = responseMock();

		handleClearChatHistory(req, res);

		expect(res.status).toHaveBeenCalledWith(400);
	});
});
