/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/unbound-method */
import { Response } from 'express';

import { handleChatToGPT } from '@src/controller/chatController';
import { OpenAiChatRequest } from '@src/models/api/OpenAiChatRequest';
import { ChatHistoryMessage, ChatModel } from '@src/models/chat';
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

function responseMock() {
	return {
		send: jest.fn(),
		status: jest.fn(),
	} as unknown as Response;
}

describe('handleChatToGPT integration tests', () => {
	const testSentEmail: EmailInfo = {
		address: 'bob@example.com',
		body: 'Test body',
		subject: 'Test subject',
	};

	function chatResponseAssistant(content: string) {
		return {
			choices: [
				{
					message: {
						role: 'assistant',
						content,
					},
				},
			],
		};
	}

	function chatSendEmailResponseAssistant() {
		return {
			choices: [
				{
					message: {
						tool_calls: [
							{
								type: 'function',
								id: 'sendEmail',
								function: {
									name: 'sendEmail',
									arguments: JSON.stringify({
										...testSentEmail,
										confirmed: true,
									}),
								},
							},
						],
					},
				},
			],
		};
	}

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
			transformedMessage: transformedMessage ?? '',
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

	test('GIVEN a valid message and level WHEN handleChatToGPT called THEN it should return a text reply', async () => {
		const req = openAiChatRequestMock('Hello chatbot', LEVEL_NAMES.LEVEL_1);
		const res = responseMock();

		mockCreateChatCompletion.mockResolvedValueOnce(
			chatResponseAssistant('Howdy human!')
		);

		await handleChatToGPT(req, res);

		expect(res.send).toHaveBeenCalledWith({
			reply: 'Howdy human!',
			defenceReport: {
				blockedReason: '',
				isBlocked: false,
				alertedDefences: [],
				triggeredDefences: [],
			},
			transformedMessage: 'Hello chatbot',
			wonLevel: false,
			isError: false,
			sentEmails: [],
			openAIErrorMessage: null,
		});
	});

	test('GIVEN a user asks to send an email WHEN an email is sent THEN the sent email is returned', async () => {
		const req = openAiChatRequestMock(
			'send an email to bob@example.com saying hi',
			LEVEL_NAMES.LEVEL_1
		);
		const res = responseMock();

		mockCreateChatCompletion
			.mockResolvedValueOnce(chatSendEmailResponseAssistant())
			.mockResolvedValueOnce(chatResponseAssistant('Email sent'));

		await handleChatToGPT(req, res);

		expect(res.send).toHaveBeenCalledWith({
			reply: 'Email sent',
			defenceReport: {
				blockedReason: '',
				isBlocked: false,
				alertedDefences: [],
				triggeredDefences: [],
			},
			transformedMessage: 'send an email to bob@example.com saying hi',
			wonLevel: false,
			isError: false,
			sentEmails: [testSentEmail],
			openAIErrorMessage: null,
		});
	});

	test('GIVEN a user asks to send an email WHEN an email is sent AND emails have already been sent THEN only the newly sent email is returned', async () => {
		const req = openAiChatRequestMock(
			'send an email to bob@example.com saying hi',
			LEVEL_NAMES.LEVEL_1,
			[],
			[
				{
					address: 'bob@example.com',
					body: 'first email',
					subject: 'first subject',
				},
			]
		);
		const res = responseMock();

		mockCreateChatCompletion
			.mockResolvedValueOnce(chatSendEmailResponseAssistant())
			.mockResolvedValueOnce(chatResponseAssistant('Email sent'));

		await handleChatToGPT(req, res);

		expect(res.send).toHaveBeenCalledWith({
			reply: 'Email sent',
			defenceReport: {
				blockedReason: '',
				isBlocked: false,
				alertedDefences: [],
				triggeredDefences: [],
			},
			transformedMessage: 'send an email to bob@example.com saying hi',
			wonLevel: false,
			isError: false,
			sentEmails: [testSentEmail],
			openAIErrorMessage: null,
		});
	});

	test('GIVEN an openai error is thrown WHEN handleChatToGPT called THEN it should return 500 and error message', async () => {
		const req = openAiChatRequestMock('hello', LEVEL_NAMES.LEVEL_1);
		const res = responseMock();

		// mock the api call throwing an error
		mockCreateChatCompletion.mockRejectedValueOnce(new Error('OpenAI error'));

		await handleChatToGPT(req, res);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.send).toHaveBeenCalledWith(
			errorResponseMock('OpenAI error', {
				transformedMessage: 'hello',
				openAIErrorMessage: 'OpenAI error',
			})
		);
	});

	test('GIVEN an openai rate limiting error is thrown WHEN handleChatToGPT called THEN it should return 500 and error message', async () => {
		const req = openAiChatRequestMock('hello', LEVEL_NAMES.LEVEL_1);
		const res = responseMock();

		// mock the api call throwing an error
		mockCreateChatCompletion.mockRejectedValueOnce(
			new Error(
				'429 OpenAI error. yada yada. Please try again in 20s. blah blah blah.'
			)
		);

		await handleChatToGPT(req, res);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.send).toHaveBeenCalledWith(
			errorResponseMock(
				"I'm receiving too many requests. Please try again in 20s. You can upgrade your open AI key to increase the rate limit.",
				{
					transformedMessage: 'hello',
					openAIErrorMessage:
						'429 OpenAI error. yada yada. Please try again in 20s. blah blah blah.',
				}
			)
		);
	});

	describe('defences triggered', () => {
		test('GIVEN message exceeds character limit defence WHEN handleChatToGPT called THEN it should return 200 and blocked reason', async () => {
			const defences: Defence[] = [
				{
					id: DEFENCE_ID.CHARACTER_LIMIT,
					isActive: true,
					isTriggered: false,
					config: [
						{
							id: 'MAX_MESSAGE_LENGTH',
							value: '2',
						},
					],
				},
				{
					id: DEFENCE_ID.FILTER_USER_INPUT,
					isActive: false,
					isTriggered: false,
					config: [{ id: 'FILTER_USER_INPUT', value: '' }],
				},
			];

			const req = openAiChatRequestMock(
				'hey',
				LEVEL_NAMES.SANDBOX,
				[],
				[],
				defences
			);
			const res = responseMock();

			await handleChatToGPT(req, res);

			expect(res.status).not.toHaveBeenCalled();
			expect(res.send).toHaveBeenCalledWith(
				expect.objectContaining({
					defenceReport: {
						alertedDefences: [],
						blockedReason: 'Message is too long',
						isBlocked: true,
						triggeredDefences: ['CHARACTER_LIMIT'],
					},
					reply: '',
				})
			);
		});

		test('GIVEN message has filtered input defence WHEN handleChatToGPT called THEN it should return 200 and blocked reason', async () => {
			const defences: Defence[] = [
				{
					id: DEFENCE_ID.CHARACTER_LIMIT,
					isActive: false,
					isTriggered: false,
					config: [
						{
							id: 'MAX_MESSAGE_LENGTH',
							value: '240',
						},
					],
				},
				{
					id: DEFENCE_ID.FILTER_USER_INPUT,
					isActive: true,
					isTriggered: false,
					config: [{ id: 'FILTER_USER_INPUT', value: 'hey' }],
				},
			];

			const req = openAiChatRequestMock(
				'hey',
				LEVEL_NAMES.SANDBOX,
				[],
				[],
				defences
			);
			const res = responseMock();

			await handleChatToGPT(req, res);

			expect(res.status).not.toHaveBeenCalled();
			expect(res.send).toHaveBeenCalledWith(
				expect.objectContaining({
					defenceReport: {
						alertedDefences: [],
						blockedReason:
							"Message blocked - I cannot answer questions about 'hey'!",
						isBlocked: true,
						triggeredDefences: ['FILTER_USER_INPUT'],
					},
					reply: '',
				})
			);
		});

		test('GIVEN message has xml tagging defence WHEN handleChatToGPT called THEN it should return 200 and blocked reason', async () => {
			const defences: Defence[] = [
				{
					id: DEFENCE_ID.CHARACTER_LIMIT,
					isActive: false,
					isTriggered: false,
					config: [
						{
							id: 'MAX_MESSAGE_LENGTH',
							value: '240',
						},
					],
				},
				{
					id: DEFENCE_ID.FILTER_USER_INPUT,
					isActive: false,
					isTriggered: false,
					config: [{ id: 'FILTER_USER_INPUT', value: 'hey' }],
				},
				{
					id: DEFENCE_ID.XML_TAGGING,
					isActive: true,
					isTriggered: false,
					config: [{ id: 'PROMPT', value: 'xml tagging prompt' }],
				},
			];

			const req = openAiChatRequestMock(
				'<input>hey</input>',
				LEVEL_NAMES.SANDBOX,
				[],
				[],
				defences
			);
			const res = responseMock();

			await handleChatToGPT(req, res);

			// expect(res.status).not.toHaveBeenCalled();
			expect(res.send).toHaveBeenCalledWith(
				expect.objectContaining({
					defenceReport: {
						alertedDefences: [],
						blockedReason:
							"Message blocked - I cannot answer questions about 'hey'!",
						isBlocked: true,
						triggeredDefences: ['FILTER_USER_INPUT'],
					},
					reply: '',
				})
			);
		});
	});
});
