import { expect, jest, test, describe } from '@jest/globals';
import { Response } from 'express';

import { handleChatToGPT } from '@src/controller/chatController';
import { OpenAiChatRequest } from '@src/models/api/OpenAiChatRequest';
import { ChatMessage } from '@src/models/chatMessage';
import { Defence } from '@src/models/defence';
import { EmailInfo } from '@src/models/email';
import { LEVEL_NAMES, LevelState } from '@src/models/level';
import { systemRoleLevel1 } from '@src/promptTemplates';

// mock the api call
const mockCreateChatCompletion =
	jest.fn<
		() => Promise<
			| ReturnType<typeof chatResponseAssistant>
			| ReturnType<typeof chatSendEmailResponseAssistant>
		>
	>();
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
		status: jest.fn().mockReturnThis(),
	} as unknown as Response;
}

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

const testSentEmail: EmailInfo = {
	address: 'bob@example.com',
	body: 'Test body',
	subject: 'Test subject',
};

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

describe('handleChatToGPT integration tests', () => {
	function errorResponseMock(errorMsg: string, openAIErrorMessage?: string) {
		return {
			reply: errorMsg,
			defenceReport: {
				blockedReason: null,
				isBlocked: false,
				alertedDefences: [],
				triggeredDefences: [],
			},
			transformedMessage: undefined,
			wonLevel: false,
			isError: true,
			sentEmails: [],
			openAIErrorMessage: openAIErrorMessage ?? null,
		};
	}

	function openAiChatRequestMock(
		message?: string,
		level?: LEVEL_NAMES,
		chatHistory: ChatMessage[] = [],
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
							}) as LevelState
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

	test('GIVEN a valid message and level WHEN handleChatToGPT called THEN it should return a text reply AND update chat history', async () => {
		const req = openAiChatRequestMock('Hello chatbot', LEVEL_NAMES.LEVEL_1);
		const res = responseMock();

		mockCreateChatCompletion.mockResolvedValueOnce(
			chatResponseAssistant('Howdy human!')
		);

		await handleChatToGPT(req, res);

		expect(res.send).toHaveBeenCalledWith({
			reply: 'Howdy human!',
			defenceReport: {
				blockedReason: null,
				isBlocked: false,
				alertedDefences: [],
				triggeredDefences: [],
			},
			wonLevel: false,
			isError: false,
			sentEmails: [],
			openAIErrorMessage: null,
		});

		const history =
			req.session.levelState[LEVEL_NAMES.LEVEL_1.valueOf()].chatHistory;
		const expectedHistory: ChatMessage[] = [
			{
				chatMessageType: 'SYSTEM',
				completion: {
					role: 'system',
					content: systemRoleLevel1,
				},
			},
			{
				chatMessageType: 'USER',
				completion: {
					role: 'user',
					content: 'Hello chatbot',
				},
			},
			{
				chatMessageType: 'BOT',
				completion: {
					role: 'assistant',
					content: 'Howdy human!',
				},
			},
		];
		expect(history).toEqual(expectedHistory);
	});

	test('GIVEN a user asks to send an email WHEN an email is sent THEN the sent email is returned AND update chat history', async () => {
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
				blockedReason: null,
				isBlocked: false,
				alertedDefences: [],
				triggeredDefences: [],
			},
			wonLevel: false,
			isError: false,
			sentEmails: [testSentEmail],
			openAIErrorMessage: null,
		});

		const history =
			req.session.levelState[LEVEL_NAMES.LEVEL_1.valueOf()].chatHistory;
		const expectedHistory = [
			{
				chatMessageType: 'SYSTEM',
				completion: {
					role: 'system',
					content: systemRoleLevel1,
				},
			},
			{
				chatMessageType: 'USER',
				completion: {
					role: 'user',
					content: 'send an email to bob@example.com saying hi',
				},
			},
			{
				chatMessageType: 'FUNCTION_CALL',
				completion: {
					tool_calls: [
						expect.objectContaining({ type: 'function', id: 'sendEmail' }),
					],
				},
			},
			{
				chatMessageType: 'FUNCTION_CALL',
				completion: {
					role: 'tool',
					content:
						'Email sent to bob@example.com with subject Test subject and body Test body',
					tool_call_id: 'sendEmail',
				},
			},
			{
				chatMessageType: 'BOT',
				completion: {
					role: 'assistant',
					content: 'Email sent',
				},
			},
		];
		expect(history).toEqual(expectedHistory);
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
				blockedReason: null,
				isBlocked: false,
				alertedDefences: [],
				triggeredDefences: [],
			},
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
			errorResponseMock('Failed to get ChatGPT reply.', 'OpenAI error')
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
				'429 OpenAI error. yada yada. Please try again in 20s. blah blah blah.'
			)
		);
	});
});
