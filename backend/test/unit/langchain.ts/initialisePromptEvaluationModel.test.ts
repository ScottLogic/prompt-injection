import { afterEach, test, jest, expect } from '@jest/globals';
import { PromptTemplate } from '@langchain/core/prompts';
import { OpenAI } from '@langchain/openai';

import { evaluatePrompt } from '@src/langchain';
import {
	promptEvalContextTemplate,
	promptEvalPrompt,
} from '@src/promptTemplates';

const mockPromptEvalChain = {
	call: jest.fn<() => Promise<{ promptEvalOutput: string }>>(),
};

jest.mock('@langchain/core/prompts', () => ({
	PromptTemplate: {
		fromTemplate: jest.fn(),
	},
}));

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
		getValidOpenAIModels: jest.fn(() => mockValidModels),
	};
});

jest.mock('@langchain/openai');

afterEach(() => {
	jest.clearAllMocks();
});

test('WHEN we query the prompt evaluation model THEN it is initialised', async () => {
	await evaluatePrompt('some input', promptEvalPrompt);
	expect(PromptTemplate.fromTemplate).toHaveBeenCalledTimes(1);
	expect(PromptTemplate.fromTemplate).toHaveBeenCalledWith(
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
