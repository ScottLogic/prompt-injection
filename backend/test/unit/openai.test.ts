import { CHAT_MESSAGE_TYPE, ChatHistoryMessage } from '@src/models/chat';
import { DEFENCE_ID, Defence } from '@src/models/defence';
import { LEVEL_NAMES } from '@src/models/level';
import {
	getValidModelsFromOpenAI,
	setSystemRoleInChatHistory,
} from '@src/openai';

// Define a mock implementation for the createChatCompletion method
const mockCreateChatCompletion = jest.fn();
let mockModelList: { id: string }[] = [];
jest.mock('openai', () => ({
	OpenAI: jest.fn().mockImplementation(() => ({
		chat: {
			completions: {
				create: mockCreateChatCompletion,
			},
		},
		models: {
			list: jest.fn().mockImplementation(() => ({
				data: mockModelList,
			})),
		},
	})),
}));

jest.mock('@src/openai', () => {
	// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
	const originalModule = jest.requireActual('@src/openai');
	// eslint-disable-next-line @typescript-eslint/no-unsafe-return
	return {
		...originalModule,
		initOpenAi: jest.fn(),
		getOpenAI: jest.fn(),
	};
});

jest.mock('@src/langchain', () => {
	// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
	const originalModule = jest.requireActual('@src/langchain');
	// eslint-disable-next-line @typescript-eslint/no-unsafe-return
	return {
		...originalModule,
		initQAModel: jest.fn(),
		initDocumentVectors: jest.fn(),
	};
});

beforeEach(() => {
	// clear environment variables
	process.env = {};
});
afterEach(() => {
	mockCreateChatCompletion.mockReset();
	jest.clearAllMocks();
});

describe('unit test getValidModelsFromOpenAI', () => {
	test('GIVEN the user has an openAI key WHEN getValidModelsFromOpenAI is called THEN it returns the models in CHAT_MODELS enum', async () => {
		process.env.OPENAI_API_KEY = 'sk-12345';
		mockModelList = [
			{ id: 'gpt-3.5-turbo' },
			{ id: 'gpt-3.5-turbo-0613' },
			{ id: 'gpt-4' },
			{ id: 'gpt-4-0613' },
			{ id: 'da-vinci-1' },
			{ id: 'da-vinci-2' },
		];
		const expectedValidModels = [
			'gpt-3.5-turbo',
			'gpt-3.5-turbo-0613',
			'gpt-4',
			'gpt-4-0613',
		];
		const validModels = await getValidModelsFromOpenAI();
		expect(validModels).toEqual(expectedValidModels);
	});
});

const mockSystemRolePrompt =
	'You are a helpful chatbot that answers questions.';
const mockDefences: Defence[] = [
	{
		id: DEFENCE_ID.SYSTEM_ROLE,
		config: [
			{
				id: 'SYSTEM_ROLE',
				value: mockSystemRolePrompt,
			},
		],
		isActive: false,
		isTriggered: false,
	},
];

const mockChatHistoryWithoutSystemRole: ChatHistoryMessage[] = [
	{
		completion: { role: 'user', content: 'What is two plus two?' },
		chatMessageType: CHAT_MESSAGE_TYPE.USER,
	},
	{
		completion: { role: 'assistant', content: 'Two plus two equals four.' },
		chatMessageType: CHAT_MESSAGE_TYPE.BOT,
	},
];

const mockChatHistoryWithSystemRole: ChatHistoryMessage[] = [
	{
		completion: { role: 'system', content: mockSystemRolePrompt },
		chatMessageType: CHAT_MESSAGE_TYPE.SYSTEM,
	},
	...mockChatHistoryWithoutSystemRole,
];

jest.mock('@src/defence', () => ({
	getSystemRole: jest.fn().mockImplementation(() => mockSystemRolePrompt),
}));

describe('unit test setSystemRoleInChatHistory', () => {
	test('GIVEN level 1 AND system role is not in chat history WHEN setSystemRoleInChatHistory is called THEN it adds the system role to the chat history', () => {
		const chatHistory = setSystemRoleInChatHistory(
			LEVEL_NAMES.LEVEL_1,
			mockDefences,
			mockChatHistoryWithoutSystemRole
		);

		expect(chatHistory).toEqual(mockChatHistoryWithSystemRole);
	});

	test('GIVEN level 1 AND system role is in chat history WHEN setSystemRoleInChatHistory is called THEN no change to the chat history', () => {
		// TODO
	});

	test('GIVEN Sandbox AND system role defence active AND system role is not in chat history WHEN setSystemRoleInChatHistory is called THEN it adds the system role to the chat history', () => {
		// TODO
	});

	test('GIVEN Sandbox AND system role defence active AND outdated system role in in chat history WHEN setSystemRoleInChatHistory is called THEN it updates the system role in the chat history', () => {
		// TODO
	});

	test('GIVEN Sandbox AND system role defence not active AND system role is in chat history WHEN setSystemRoleInChatHistory is called THEN it removes the system role from the chat history', () => {
		// TODO
	});

	test('GIVEN Sandbox AND system role defence not active AND system role is not in chat history WHEN setSystemRoleInChatHistory is called THEN no change to the chat history', () => {
		// TODO
	});
});
