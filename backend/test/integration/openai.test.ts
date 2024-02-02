import { expect, jest, test, describe } from '@jest/globals';

import { defaultDefences } from '@src/defaultDefences';
import {
	CHAT_MESSAGE_TYPE,
	CHAT_MODELS,
	ChatHistoryMessage,
	ChatModel,
} from '@src/models/chat';
import { Defence } from '@src/models/defence';
import { chatGptSendMessage } from '@src/openai';

const mockCreateChatCompletion =
	jest.fn<() => Promise<ReturnType<typeof chatResponseAssistant>>>();

// Mock the OpenAI api class
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
		const chatHistoryWithMessage: ChatHistoryMessage[] = [
			{
				chatMessageType: CHAT_MESSAGE_TYPE.USER,
				completion: {
					role: 'user',
					content: 'Hi',
				},
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

		// Mock the createChatCompletion function
		mockCreateChatCompletion.mockResolvedValueOnce(chatResponseAssistant('Hi'));

		// send the message
		const reply = await chatGptSendMessage(
			chatHistoryWithMessage,
			defences,
			chatModel
		);

		expect(reply).toBeDefined();
		expect(reply.chatResponse.completion).toBeDefined();
		expect(reply.chatResponse.completion?.content).toBe('Hi');

		// restore the mock
		mockCreateChatCompletion.mockRestore();
	});
});
