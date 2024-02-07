import { expect, jest, test, describe } from '@jest/globals';

import { defaultDefences } from '@src/defaultDefences';
import { CHAT_MODELS, ChatModel } from '@src/models/chat';
import { ChatMessage } from '@src/models/chatMessage';
import { Defence } from '@src/models/defence';
import { chatGptSendMessage } from '@src/openai';

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
});
