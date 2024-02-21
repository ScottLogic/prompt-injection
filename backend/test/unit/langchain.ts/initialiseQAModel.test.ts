import { afterEach, beforeEach, test, jest, expect } from '@jest/globals';
import { RetrievalQAChain } from 'langchain/chains';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { PromptTemplate } from 'langchain/prompts';

import { getDocumentVectors } from '@src/document';
import { queryDocuments } from '@src/langchain';
import { LEVEL_NAMES } from '@src/models/level';
import { getOpenAIKey } from '@src/openai';
import { qAPrompt, qaContextTemplate } from '@src/promptTemplates';

const mockRetrievalQAChain = {
	call: jest.fn<() => Promise<{ text: string }>>(),
};
const mockFromLLM = jest.fn<() => typeof mockRetrievalQAChain>();
const mockFromTemplate = jest.fn<typeof PromptTemplate.fromTemplate>();

// eslint-disable-next-line prefer-const
let mockValidModels: string[] = [];

// mock OpenAIEmbeddings
jest.mock('langchain/embeddings/openai', () => {
	return {
		OpenAIEmbeddings: jest.fn().mockImplementation(() => {
			return {
				init: jest.fn(),
			};
		}),
	};
});

// mock PromptTemplate.fromTemplate static method
jest.mock('langchain/prompts');
PromptTemplate.fromTemplate = mockFromTemplate;

// mock OpenAI for ChatOpenAI class
jest.mock('langchain/chat_models/openai');

// mock chains
jest.mock('langchain/chains', () => {
	return {
		RetrievalQAChain: jest.fn().mockImplementation(() => {
			return mockRetrievalQAChain;
		}),
	};
});
RetrievalQAChain.fromLLM =
	mockFromLLM as unknown as typeof RetrievalQAChain.fromLLM;

jest.mock('@src/openai');
const mockGetOpenAIKey = jest.fn<typeof getOpenAIKey>();
mockGetOpenAIKey.mockReturnValue('sk-12345');

jest.mock('@src/openai', () => {
	const originalModule =
		jest.requireActual<typeof import('@src/openai')>('@src/openai'); // can we remove this
	return {
		...originalModule,
		getValidOpenAIModels: jest.fn(() => mockValidModels),
	};
});

jest.mock('@src/document');
const mockGetDocumentVectors = getDocumentVectors as unknown as jest.Mock<
	() => { docVector: { asRetriever: () => string } }[]
>;
mockGetDocumentVectors.mockReturnValue([
	{ docVector: { asRetriever: () => 'retriever' } },
]);

beforeEach(() => {
	mockFromLLM.mockImplementation(() => mockRetrievalQAChain); // this is weird
});

afterEach(() => {
	mockRetrievalQAChain.call.mockRestore();
	mockFromLLM.mockRestore();
	mockFromTemplate.mockRestore();
});

test('WHEN we query the documents with an empty prompt THEN the qa llm is initialised and the prompt is set to the default', async () => {
	const level = LEVEL_NAMES.LEVEL_1;
	const prompt = '';

	await queryDocuments('some question', prompt, level);

	expect(mockFromLLM).toHaveBeenCalledTimes(1);
	expect(mockFromTemplate).toHaveBeenCalledTimes(1);
	expect(mockFromTemplate).toHaveBeenCalledWith(
		`${qAPrompt}\n${qaContextTemplate}`
	);
});

test('WHEN we query the documents with a prompt THEN the llm is initialised and prompt is set to the given prompt', async () => {
	const level = LEVEL_NAMES.LEVEL_1;
	const prompt = 'this is a test prompt. ';

	await queryDocuments('some question', prompt, level);

	expect(mockFromLLM).toHaveBeenCalledTimes(1);
	expect(mockFromTemplate).toHaveBeenCalledTimes(1);
	expect(mockFromTemplate).toHaveBeenCalledWith(
		`this is a test prompt. \n${qaContextTemplate}`
	);
});

test('GIVEN the QA LLM WHEN a question is asked THEN it is initialised AND it answers ', async () => {
	const question = 'who is the CEO?';
	const level = LEVEL_NAMES.LEVEL_1;
	const prompt = '';

	mockRetrievalQAChain.call.mockResolvedValueOnce({
		text: 'The CEO is Bill.',
	});

	const answer = await queryDocuments(question, prompt, level);

	expect(mockFromLLM).toHaveBeenCalledTimes(1);
	expect(mockRetrievalQAChain.call).toHaveBeenCalledTimes(1);
	expect(answer).toEqual('The CEO is Bill.');
});

test('GIVEN the users api key supports GPT-4 WHEN the QA model is initialised THEN it is initialised with GPT-4', async () => {
	mockValidModels = ['gpt-4', 'gpt-3.5-turbo', 'gpt-3'];

	const level = LEVEL_NAMES.LEVEL_1;
	const prompt = 'this is a test prompt. ';

	await queryDocuments('some question', prompt, level);

	expect(ChatOpenAI).toHaveBeenCalledWith({
		modelName: 'gpt-4',
		streaming: true,
		openAIApiKey: 'sk-12345',
	});
});

test('GIVEN the users api key does not support GPT-4 WHEN the QA model is initialised THEN it is initialised with gpt-3.5-turbo', async () => {
	mockValidModels = ['gpt-2', 'gpt-3.5-turbo', 'gpt-3'];

	const level = LEVEL_NAMES.LEVEL_1;
	const prompt = 'this is a test prompt. ';

	await queryDocuments('some question', prompt, level);

	expect(ChatOpenAI).toHaveBeenCalledWith({
		modelName: 'gpt-3.5-turbo',
		streaming: true,
		openAIApiKey: 'sk-12345',
	});
});
