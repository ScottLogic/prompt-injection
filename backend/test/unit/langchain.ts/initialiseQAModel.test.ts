import { afterEach, beforeEach, test, jest, expect } from '@jest/globals';
import { PromptTemplate } from '@langchain/core/prompts';
import { ChatOpenAI } from '@langchain/openai';
import { RetrievalQAChain } from 'langchain/chains';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';

import { getDocumentVectors } from '@src/document';
import { queryDocuments } from '@src/langchain';
import { LEVEL_NAMES } from '@src/models/level';
import { qAPrompt, qaContextTemplate } from '@src/promptTemplates';

const mockFromTemplate = jest.mocked(PromptTemplate.fromTemplate);
const mockFromLLM = jest.mocked(RetrievalQAChain.fromLLM);
const mockRetrievalQAChain = {
	invoke: jest.fn<typeof RetrievalQAChain.prototype.invoke>(),
};

// eslint-disable-next-line prefer-const
const mockValidModels: string[] = [];
const expectedAnswer = 'The CEO is Bill.';

// mock OpenAIEmbeddings
jest.mock('@langchain/openai', () => {
	return {
		OpenAIEmbeddings: jest.fn().mockImplementation(() => {
			return {
				init: jest.fn(),
			};
		}),
		ChatOpenAI: jest.fn(),
	};
});

jest.mock('@langchain/core/prompts', () => ({
	PromptTemplate: {
		fromTemplate: jest.fn(),
	},
}));

jest.mock('langchain/chains', () => ({
	RetrievalQAChain: {
		fromLLM: jest.fn(() => mockRetrievalQAChain),
	},
}));

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
	() => {
		docVector: {
			asRetriever: (k: number) => string;
			memoryVectors: MemoryVectorStore['memoryVectors'];
		};
	}[]
>;
mockGetDocumentVectors.mockReturnValue([
	{
		docVector: {
			asRetriever: () => 'retriever',
			memoryVectors: [],
		},
	},
]);

beforeEach(() => {
	mockRetrievalQAChain.invoke.mockResolvedValueOnce({
		text: expectedAnswer,
	});
	mockFromLLM.mockImplementation(
		() => mockRetrievalQAChain as unknown as RetrievalQAChain
	);
});

afterEach(() => {
	mockRetrievalQAChain.invoke.mockRestore();
	mockFromLLM.mockRestore();
	mockFromTemplate.mockRestore();
	mockValidModels.length = 0;
});

test('WHEN we query the documents with an empty prompt THEN the qa llm is initialised and the prompt is set to the default', async () => {
	const level = LEVEL_NAMES.LEVEL_1;
	const prompt = '';

	await queryDocuments('some question', prompt, level);

	expect(RetrievalQAChain.fromLLM).toHaveBeenCalledTimes(1);
	expect(mockFromTemplate).toHaveBeenCalledTimes(1);
	expect(mockFromTemplate).toHaveBeenCalledWith(
		`${qAPrompt}\n${qaContextTemplate}`
	);
});

test('WHEN we query the documents with a prompt THEN the llm is initialised and prompt is set to the given prompt', async () => {
	const level = LEVEL_NAMES.LEVEL_1;
	const prompt = 'this is a test prompt. ';

	await queryDocuments('some question', prompt, level);

	expect(RetrievalQAChain.fromLLM).toHaveBeenCalledTimes(1);
	expect(mockFromTemplate).toHaveBeenCalledTimes(1);
	expect(mockFromTemplate).toHaveBeenCalledWith(
		`this is a test prompt. \n${qaContextTemplate}`
	);
});

test('GIVEN the QA LLM WHEN a question is asked THEN it is initialised AND it answers ', async () => {
	const question = 'who is the CEO?';
	const level = LEVEL_NAMES.LEVEL_1;
	const prompt = '';

	const answer = await queryDocuments(question, prompt, level);

	expect(RetrievalQAChain.fromLLM).toHaveBeenCalledTimes(1);
	expect(answer).toEqual(expectedAnswer);
});

test('GIVEN the users api key supports gpt-4o WHEN the QA model is initialised THEN it is initialised with gpt-4o', async () => {
	mockValidModels.push('gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo', 'gpt-3');

	const level = LEVEL_NAMES.LEVEL_1;
	const prompt = 'this is a test prompt. ';

	await queryDocuments('some question', prompt, level);

	expect(ChatOpenAI).toHaveBeenCalledWith({
		modelName: 'gpt-4o',
		streaming: true,
		openAIApiKey: 'sk-12345',
	});
});

test('GIVEN the users api key supports gpt-4-turbo but not gpt-4o WHEN the QA model is initialised THEN it is initialised with gpt-4-turbo', async () => {
	mockValidModels.push('gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo', 'gpt-3');

	const level = LEVEL_NAMES.LEVEL_1;
	const prompt = 'this is a test prompt. ';

	await queryDocuments('some question', prompt, level);

	expect(ChatOpenAI).toHaveBeenCalledWith({
		modelName: 'gpt-4o',
		streaming: true,
		openAIApiKey: 'sk-12345',
	});
});

test('GIVEN the users api key does not support gpt-4o or gpt-4-turbo WHEN the QA model is initialised THEN it is initialised with gpt-3.5-turbo', async () => {
	mockValidModels.push('gpt-2', 'gpt-3.5-turbo', 'gpt-3');

	const level = LEVEL_NAMES.LEVEL_1;
	const prompt = 'this is a test prompt. ';

	await queryDocuments('some question', prompt, level);

	expect(ChatOpenAI).toHaveBeenCalledWith({
		modelName: 'gpt-3.5-turbo',
		streaming: true,
		openAIApiKey: 'sk-12345',
	});
});
