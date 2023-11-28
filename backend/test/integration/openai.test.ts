import { defaultDefences } from '@src/defaultDefences';
import { activateDefence, configureDefence } from '@src/defence';
import {
	CHAT_MESSAGE_TYPE,
	CHAT_MODELS,
	ChatHistoryMessage,
	ChatModel,
} from '@src/models/chat';
import { DEFENCE_ID, Defence } from '@src/models/defence';
import { EmailInfo } from '@src/models/email';
import { chatGptSendMessage } from '@src/openai';
import { systemRoleDefault } from '@src/promptTemplates';

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

	test('GIVEN SYSTEM_ROLE defence is active WHEN sending message THEN system role is added to chat history', async () => {
		const message = 'Hello';
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

		// set the system role prompt
		const defences = activateDefence(DEFENCE_ID.SYSTEM_ROLE, defaultDefences);

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
		expect(reply.completion?.content).toBe('Hi');
		// check the chat history has been updated
		expect(chatHistory.length).toBe(3);
		// system role is added to the start of the chat history
		expect(chatHistory[0].completion?.role).toBe('system');
		expect(chatHistory[0].completion?.content).toBe(systemRoleDefault);
		expect(chatHistory[1].completion?.role).toBe('user');
		expect(chatHistory[1].completion?.content).toBe('Hello');
		expect(chatHistory[2].completion?.role).toBe('assistant');
		expect(chatHistory[2].completion?.content).toBe('Hi');

		// restore the mock
		mockCreateChatCompletion.mockRestore();
	});

	test('GIVEN SYSTEM_ROLE defence is active WHEN sending message THEN system role is added to the start of the chat history', async () => {
		const message = 'Hello';
		const isOriginalMessage = true;
		const chatHistory: ChatHistoryMessage[] = [
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

		// activate the SYSTEM_ROLE defence
		const defences = activateDefence(DEFENCE_ID.SYSTEM_ROLE, defaultDefences);

		// Mock the createChatCompletion function
		mockCreateChatCompletion.mockResolvedValueOnce(chatResponseAssistant('Hi'));

		// send the message
		const reply = await chatGptSendMessage(
			chatHistory,
			defences,
			chatModel,
			message,
			isOriginalMessage,
			sentEmails
		);

		expect(reply).toBeDefined();
		expect(reply.completion?.content).toBe('Hi');
		// check the chat history has been updated
		expect(chatHistory.length).toBe(5);
		// system role is added to the start of the chat history
		expect(chatHistory[0].completion?.role).toBe('system');
		expect(chatHistory[0].completion?.content).toBe(systemRoleDefault);
		// rest of the chat history is in order
		expect(chatHistory[1].completion?.role).toBe('user');
		expect(chatHistory[1].completion?.content).toBe("I'm a user");
		expect(chatHistory[2].completion?.role).toBe('assistant');
		expect(chatHistory[2].completion?.content).toBe("I'm an assistant");
		expect(chatHistory[3].completion?.role).toBe('user');
		expect(chatHistory[3].completion?.content).toBe('Hello');
		expect(chatHistory[4].completion?.role).toBe('assistant');
		expect(chatHistory[4].completion?.content).toBe('Hi');

		// restore the mock
		mockCreateChatCompletion.mockRestore();
	});

	test('GIVEN SYSTEM_ROLE defence is inactive WHEN sending message THEN system role is removed from the chat history', async () => {
		const message = 'Hello';
		const chatHistory: ChatHistoryMessage[] = [
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
		expect(reply.completion?.content).toBe('Hi');
		// check the chat history has been updated
		expect(chatHistory.length).toBe(4);
		// system role is removed from the start of the chat history
		// rest of the chat history is in order
		expect(chatHistory[0].completion?.role).toBe('user');
		expect(chatHistory[0].completion?.content).toBe("I'm a user");
		expect(chatHistory[1].completion?.role).toBe('assistant');
		expect(chatHistory[1].completion?.content).toBe("I'm an assistant");
		expect(chatHistory[2].completion?.role).toBe('user');
		expect(chatHistory[2].completion?.content).toBe('Hello');
		expect(chatHistory[3].completion?.role).toBe('assistant');
		expect(chatHistory[3].completion?.content).toBe('Hi');

		// restore the mock
		mockCreateChatCompletion.mockRestore();
	});

	test(
		'GIVEN SYSTEM_ROLE defence is configured AND the system role is already in the chat history ' +
			'WHEN sending message THEN system role is replaced with default value in the chat history',
		async () => {
			const message = 'Hello';
			const chatHistory: ChatHistoryMessage[] = [
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

			const defences = configureDefence(
				DEFENCE_ID.SYSTEM_ROLE,
				activateDefence(DEFENCE_ID.SYSTEM_ROLE, defaultDefences),
				[
					{
						id: 'systemRole',
						value: 'You are not a helpful assistant',
					},
				]
			);

			// Mock the createChatCompletion function
			mockCreateChatCompletion.mockResolvedValueOnce(
				chatResponseAssistant('Hi')
			);

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
			expect(reply.completion?.content).toBe('Hi');
			// check the chat history has been updated
			expect(chatHistory.length).toBe(5);
			// system role is added to the start of the chat history
			expect(chatHistory[0].completion?.role).toBe('system');
			expect(chatHistory[0].completion?.content).toBe(
				'You are not a helpful assistant'
			);
			// rest of the chat history is in order
			expect(chatHistory[1].completion?.role).toBe('user');
			expect(chatHistory[1].completion?.content).toBe("I'm a user");
			expect(chatHistory[2].completion?.role).toBe('assistant');
			expect(chatHistory[2].completion?.content).toBe("I'm an assistant");
			expect(chatHistory[3].completion?.role).toBe('user');
			expect(chatHistory[3].completion?.content).toBe('Hello');
			expect(chatHistory[4].completion?.role).toBe('assistant');
			expect(chatHistory[4].completion?.content).toBe('Hi');

			// restore the mock
			mockCreateChatCompletion.mockRestore();
		}
	);

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
			'My original response was blocked as it contained a restricted word/phrase. Ask me something else. '
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
