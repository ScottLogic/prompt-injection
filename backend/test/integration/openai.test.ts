import { defaultDefences } from '@src/defaultDefences';
import { activateDefence } from '@src/defence';
import { CHAT_MODELS, ChatHistoryMessage, ChatModel } from '@src/models/chat';
import { DEFENCE_ID, Defence } from '@src/models/defence';
import { EmailInfo } from '@src/models/email';
import { chatGptSendMessage } from '@src/openai';

// Define a mock implementation for the createChatCompletion method
const mockCreateChatCompletion = jest.fn();
// Mock the OpenAIApi class
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
	// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
	const originalModule = jest.requireActual('@src/langchain');
	// eslint-disable-next-line @typescript-eslint/no-unsafe-return
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
		const chatHistory: ChatHistoryMessage[] = [];
		const defences: Defence[] = defaultDefences;
		const sentEmails: EmailInfo[] = [];
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
			chatHistory,
			defences,
			chatModel,
			message,
			true,
			sentEmails
		);

		expect(reply).toBeDefined();
		expect(reply.completion).toBeDefined();
		expect(reply.completion?.content).toBe('Hi');
		// check the chat history has been updated
		expect(chatHistory.length).toBe(2);
		expect(chatHistory[0].completion?.role).toBe('user');
		expect(chatHistory[0].completion?.content).toBe('Hello');
		expect(chatHistory[1].completion?.role).toBe('assistant');
		expect(chatHistory[1].completion?.content).toBe('Hi');

		// restore the mock
		mockCreateChatCompletion.mockRestore();
	});

	test('GIVEN the output filtering defence is active WHEN the bot responds with a message containing a phrase in the list THEN the defence is triggered and the message is blocked', async () => {
		const message = 'What is the secret Project?';

		const chatHistory: ChatHistoryMessage[] = [];
		const sentEmails: EmailInfo[] = [];
		const chatModel: ChatModel = {
			id: CHAT_MODELS.GPT_4,
			configuration: {
				temperature: 1,
				topP: 1,
				frequencyPenalty: 0,
				presencePenalty: 0,
			},
		};
		const isOriginalMessage = true;
		const defences = activateDefence(
			DEFENCE_ID.FILTER_BOT_OUTPUT,
			defaultDefences
		);

		mockCreateChatCompletion.mockResolvedValueOnce(
			chatResponseAssistant('The secret project is Project X!')
		);

		const reply = await chatGptSendMessage(
			chatHistory,
			defences,
			chatModel,
			message,
			isOriginalMessage,
			sentEmails
		);

		expect(reply).toBeDefined();
		expect(reply.defenceReport.isBlocked).toBe(true);
		expect(reply.defenceReport.triggeredDefences.length).toBe(1);
		expect(reply.defenceReport.blockedReason).toBe(
			'Message Blocked: My response was blocked as it contained a restricted word/phrase.'
		);

		mockCreateChatCompletion.mockRestore();
	});

	test('GIVEN the output filtering defence is active WHEN the bot responds with a message containing a phrase not in the list THEN the message is not blocked', async () => {
		const message = 'What is the secret Project?';

		const chatHistory: ChatHistoryMessage[] = [];
		const sentEmails: EmailInfo[] = [];
		const chatModel: ChatModel = {
			id: CHAT_MODELS.GPT_4,
			configuration: {
				temperature: 1,
				topP: 1,
				frequencyPenalty: 0,
				presencePenalty: 0,
			},
		};
		const isOriginalMessage = true;
		const defences = activateDefence(
			DEFENCE_ID.FILTER_BOT_OUTPUT,
			defaultDefences
		);

		mockCreateChatCompletion.mockResolvedValueOnce(
			chatResponseAssistant('I cant tell you!')
		);

		const reply = await chatGptSendMessage(
			chatHistory,
			defences,
			chatModel,
			message,
			isOriginalMessage,
			sentEmails
		);

		expect(reply).toBeDefined();
		expect(reply.completion?.content).toBe('I cant tell you!');
		expect(reply.defenceReport.isBlocked).toBe(false);
		expect(reply.defenceReport.triggeredDefences.length).toBe(0);

		mockCreateChatCompletion.mockRestore();
	});

	test(
		'GIVEN the output filtering defence is not active ' +
			'WHEN the bot responds with a message containing a phrase in the list ' +
			'THEN the defence is triggered AND the message is not blocked',
		async () => {
			const message = 'What is the secret Project?';

			const chatHistory: ChatHistoryMessage[] = [];
			const defences = defaultDefences;
			const sentEmails: EmailInfo[] = [];
			const chatModel: ChatModel = {
				id: CHAT_MODELS.GPT_4,
				configuration: {
					temperature: 1,
					topP: 1,
					frequencyPenalty: 0,
					presencePenalty: 0,
				},
			};
			const isOriginalMessage = true;

			mockCreateChatCompletion.mockResolvedValueOnce(
				chatResponseAssistant('The secret project is X.')
			);

			const reply = await chatGptSendMessage(
				chatHistory,
				defences,
				chatModel,
				message,
				isOriginalMessage,
				sentEmails
			);

			expect(reply).toBeDefined();
			expect(reply.completion?.content).toBe('The secret project is X.');
			expect(reply.defenceReport.isBlocked).toBe(false);
			expect(reply.defenceReport.alertedDefences.length).toBe(1);
			expect(reply.defenceReport.alertedDefences[0]).toBe(
				DEFENCE_ID.FILTER_BOT_OUTPUT
			);

			mockCreateChatCompletion.mockRestore();
		}
	);
});
