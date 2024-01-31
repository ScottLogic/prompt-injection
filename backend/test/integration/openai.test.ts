import { expect, jest, test, describe } from '@jest/globals';

import { defaultDefences } from '@src/defaultDefences';
import { activateDefence, configureDefence } from '@src/defence';
import { CHAT_MESSAGE_TYPE, CHAT_MODELS, ChatModel } from '@src/models/chat';
import { ChatMessage } from '@src/models/chatMessage';
import { DEFENCE_ID, Defence } from '@src/models/defence';
import { chatGptSendMessage } from '@src/openai';
import { systemRoleDefault } from '@src/promptTemplates';

const mockCreateChatCompletion =
	jest.fn<() => Promise<ReturnType<typeof chatResponseAssistant>>>();

jest.mock('openai', () => ({
	OpenAI: jest.fn().mockImplementation(() => ({
		chat: {
			completions: {
				create: mockCreateChatCompletion,
			},
		},
	})),
}));

// mock the queryPromptEvaluationModel function
jest.mock('@src/langchain', () => {
	const originalModule =
		jest.requireActual<typeof import('@src/langchain')>('@src/langchain');
	return {
		...originalModule,
		queryPromptEvaluationModel: () => {
			return {
				isMalicious: false,
				reason: '',
			};
		},
	};
});

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

describe('OpenAI Integration Tests', () => {
	test('GIVEN OpenAI initialised WHEN sending message THEN reply is returned', async () => {
		const message = 'Hello';
		const initChatHistory: ChatMessage[] = [];
		const defences: Defence[] = defaultDefences;
		const chatModel: ChatModel = {
			id: CHAT_MODELS.GPT_4,
			configuration: {
				temperature: 1,
				topP: 1,
				frequencyPenalty: 0,
				presencePenalty: 0,
			},
		};

		mockCreateChatCompletion.mockResolvedValueOnce(chatResponseAssistant('Hi'));

		const reply = await chatGptSendMessage(
			initChatHistory,
			defences,
			chatModel,
			message
		);

		expect(reply).toBeDefined();
		expect(reply.chatResponse.completion).toBeDefined();
		expect(reply.chatResponse.completion?.content).toBe('Hi');

		mockCreateChatCompletion.mockRestore();
	});

	test('GIVEN SYSTEM_ROLE defence is active WHEN sending message THEN system role is added to chat history', async () => {
		const message = 'Hello';
		const initChatHistory: ChatMessage[] = [];
		const chatModel: ChatModel = {
			id: CHAT_MODELS.GPT_4,
			configuration: {
				temperature: 1,
				topP: 1,
				frequencyPenalty: 0,
				presencePenalty: 0,
			},
		};

		const defences = activateDefence(DEFENCE_ID.SYSTEM_ROLE, defaultDefences);

		mockCreateChatCompletion.mockResolvedValueOnce(chatResponseAssistant('Hi'));

		const reply = await chatGptSendMessage(
			initChatHistory,
			defences,
			chatModel,
			message
		);

		const { chatResponse, chatHistory } = reply;

		expect(reply).toBeDefined();
		expect(chatResponse.completion?.content).toBe('Hi');
		expect(chatHistory).toEqual([
			{
				completion: {
					role: 'system',
					content: systemRoleDefault,
				},
				chatMessageType: CHAT_MESSAGE_TYPE.SYSTEM,
			},
		]);

		mockCreateChatCompletion.mockRestore();
	});

	test('GIVEN SYSTEM_ROLE defence is active WHEN sending message THEN system role is added to the start of the chat history', async () => {
		const message = 'Hello';
		const initChatHistory: ChatMessage[] = [
			{
				completion: {
					role: 'user',
					content: "I'm a user",
				},
				chatMessageType: CHAT_MESSAGE_TYPE.USER,
			},
			{
				completion: {
					role: 'assistant',
					content: "I'm an assistant",
				},
				chatMessageType: CHAT_MESSAGE_TYPE.BOT,
			},
		];
		const chatModel: ChatModel = {
			id: CHAT_MODELS.GPT_4,
			configuration: {
				temperature: 1,
				topP: 1,
				frequencyPenalty: 0,
				presencePenalty: 0,
			},
		};

		const defences = activateDefence(DEFENCE_ID.SYSTEM_ROLE, defaultDefences);

		mockCreateChatCompletion.mockResolvedValueOnce(chatResponseAssistant('Hi'));

		const reply = await chatGptSendMessage(
			initChatHistory,
			defences,
			chatModel,
			message
		);

		const { chatResponse, chatHistory } = reply;

		expect(reply).toBeDefined();
		expect(chatResponse.completion?.content).toBe('Hi');
		expect(chatHistory).toEqual([
			{
				completion: {
					role: 'system',
					content: systemRoleDefault,
				},
				chatMessageType: CHAT_MESSAGE_TYPE.SYSTEM,
			},
			{
				completion: {
					role: 'user',
					content: "I'm a user",
				},
				chatMessageType: CHAT_MESSAGE_TYPE.USER,
			},
			{
				completion: {
					role: 'assistant',
					content: "I'm an assistant",
				},
				chatMessageType: CHAT_MESSAGE_TYPE.BOT,
			},
		]);

		mockCreateChatCompletion.mockRestore();
	});

	test('GIVEN SYSTEM_ROLE defence is inactive WHEN sending message THEN system role is removed from the chat history', async () => {
		const message = 'Hello';
		const initChatHistory: ChatMessage[] = [
			{
				completion: {
					role: 'system',
					content: 'You are a helpful assistant',
				},
				chatMessageType: CHAT_MESSAGE_TYPE.SYSTEM,
			},
			{
				completion: {
					role: 'user',
					content: "I'm a user",
				},
				chatMessageType: CHAT_MESSAGE_TYPE.USER,
			},
			{
				completion: {
					role: 'assistant',
					content: "I'm an assistant",
				},
				chatMessageType: CHAT_MESSAGE_TYPE.BOT,
			},
		];
		const defences: Defence[] = defaultDefences;
		const chatModel: ChatModel = {
			id: CHAT_MODELS.GPT_4,
			configuration: {
				temperature: 1,
				topP: 1,
				frequencyPenalty: 0,
				presencePenalty: 0,
			},
		};

		mockCreateChatCompletion.mockResolvedValueOnce(chatResponseAssistant('Hi'));

		const reply = await chatGptSendMessage(
			initChatHistory,
			defences,
			chatModel,
			message
		);

		const { chatResponse, chatHistory } = reply;

		expect(reply).toBeDefined();
		expect(chatResponse.completion?.content).toBe('Hi');
		expect(chatHistory).toEqual([
			{
				completion: {
					role: 'user',
					content: "I'm a user",
				},
				chatMessageType: CHAT_MESSAGE_TYPE.USER,
			},
			{
				completion: {
					role: 'assistant',
					content: "I'm an assistant",
				},
				chatMessageType: CHAT_MESSAGE_TYPE.BOT,
			},
		]);

		mockCreateChatCompletion.mockRestore();
	});

	test(
		'GIVEN SYSTEM_ROLE defence is configured AND the system role is already in the chat history ' +
			'WHEN sending message THEN system role is replaced with default value in the chat history',
		async () => {
			const message = 'Hello';
			const initChatHistory: ChatMessage[] = [
				{
					completion: {
						role: 'system',
						content: 'You are a helpful assistant',
					},
					chatMessageType: CHAT_MESSAGE_TYPE.SYSTEM,
				},
				{
					completion: {
						role: 'user',
						content: "I'm a user",
					},
					chatMessageType: CHAT_MESSAGE_TYPE.USER,
				},
				{
					completion: {
						role: 'assistant',
						content: "I'm an assistant",
					},
					chatMessageType: CHAT_MESSAGE_TYPE.BOT,
				},
			];
			const chatModel: ChatModel = {
				id: CHAT_MODELS.GPT_4,
				configuration: {
					temperature: 1,
					topP: 1,
					frequencyPenalty: 0,
					presencePenalty: 0,
				},
			};

			const defences = configureDefence(
				DEFENCE_ID.SYSTEM_ROLE,
				activateDefence(DEFENCE_ID.SYSTEM_ROLE, defaultDefences),
				[
					{
						id: 'SYSTEM_ROLE',
						value: 'You are not a helpful assistant',
					},
				]
			);

			mockCreateChatCompletion.mockResolvedValueOnce(
				chatResponseAssistant('Hi')
			);

			const reply = await chatGptSendMessage(
				initChatHistory,
				defences,
				chatModel,
				message
			);

			const { chatResponse, chatHistory } = reply;

			expect(reply).toBeDefined();
			expect(chatResponse.completion?.content).toBe('Hi');
			expect(chatHistory).toEqual([
				{
					completion: {
						role: 'system',
						content: 'You are not a helpful assistant',
					},
					chatMessageType: CHAT_MESSAGE_TYPE.SYSTEM,
				},
				{
					completion: {
						role: 'user',
						content: "I'm a user",
					},
					chatMessageType: CHAT_MESSAGE_TYPE.USER,
				},
				{
					completion: {
						role: 'assistant',
						content: "I'm an assistant",
					},
					chatMessageType: CHAT_MESSAGE_TYPE.BOT,
				},
			]);

			mockCreateChatCompletion.mockRestore();
		}
	);
});
