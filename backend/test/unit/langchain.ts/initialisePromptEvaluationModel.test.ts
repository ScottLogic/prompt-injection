import { afterEach, test, jest, expect } from '@jest/globals';
import { OpenAI } from 'langchain/llms/openai';
import { PromptTemplate } from 'langchain/prompts';

import { evaluatePrompt } from '@src/langchain';
import {
	promptEvalContextTemplate,
	promptEvalPrompt,
} from '@src/promptTemplates';

const mockPromptEvalChain = {
	call: jest.fn<() => Promise<{ promptEvalOutput: string }>>(),
};

jest.mock('langchain/prompts');
const mockFromTemplate = jest.fn<typeof PromptTemplate.fromTemplate>();
PromptTemplate.fromTemplate = mockFromTemplate;

jest.mock('langchain/chains', () => {
	return {
		LLMChain: jest.fn().mockImplementation(() => {
			return mockPromptEvalChain;
		}),
	};
});

// eslint-disable-next-line prefer-const
let mockValidModels: string[] = [];

jest.mock('@src/openai', () => {
	const originalModule =
		jest.requireActual<typeof import('@src/openai')>('@src/openai');
	return {
		...originalModule,
		getValidOpenAIModelsList: jest.fn(() => mockValidModels),
	};
});

jest.mock('langchain/llms/openai');

afterEach(() => {
	jest.clearAllMocks();
});

test('WHEN we query the prompt evaluation model THEN it is initialised', async () => {
	await evaluatePrompt('some input', promptEvalPrompt);
	expect(mockFromTemplate).toHaveBeenCalledTimes(1);
	expect(mockFromTemplate).toHaveBeenCalledWith(
		`${promptEvalPrompt}\n${promptEvalContextTemplate}`
	);
});

test('GIVEN the prompt evaluation model is not initialised WHEN it is asked to evaluate an input it returns not malicious', async () => {
	mockPromptEvalChain.call.mockResolvedValueOnce({ promptEvalOutput: '' });

	const result = await evaluatePrompt('message', 'Prompt');

	expect(result).toEqual(false);
});

test('GIVEN the users api key supports GPT-4 WHEN the prompt evaluation model is initialised THEN it is initialised with GPT-4', async () => {
	mockValidModels = ['gpt-4', 'gpt-3.5-turbo', 'gpt-3'];

	const prompt = 'this is a test prompt. ';

	await evaluatePrompt('some input', prompt);

	expect(OpenAI).toHaveBeenCalledWith({
		modelName: 'gpt-4',
		temperature: 0,
		openAIApiKey: 'sk-12345',
	});
});

test('GIVEN the users api key does not support GPT-4 WHEN the prompt evaluation model is initialised THEN it is initialised with gpt-3.5-turbo', async () => {
	mockValidModels = ['gpt-2', 'gpt-3.5-turbo', 'gpt-3'];

	const prompt = 'this is a test prompt. ';

	await evaluatePrompt('some input', prompt);

	expect(OpenAI).toHaveBeenCalledWith({
		modelName: 'gpt-3.5-turbo',
		temperature: 0,
		openAIApiKey: 'sk-12345',
	});
});
