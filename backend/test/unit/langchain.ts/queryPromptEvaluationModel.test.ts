import { test, jest, expect } from '@jest/globals';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { PromptTemplate } from 'langchain/prompts';

import { queryPromptEvaluationModel } from '@src/langchain';
import {
	promptEvalContextTemplate,
	promptEvalPrompt,
} from '@src/promptTemplates';

const mockPromptEvalChain = {
	call: jest.fn<() => Promise<{ promptEvalOutput: string }>>(),
};

// eslint-disable-next-line jest/unbound-method
const mockFromTemplate = PromptTemplate.fromTemplate as jest.MockedFunction<
	typeof PromptTemplate.fromTemplate
>;

const mockInitOpenAI = jest.fn();

jest.mock('langchain/llms/openai', () => {
	return {
		OpenAI: jest.fn().mockImplementation(() => {
			return mockInitOpenAI;
		}),
	};
});

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

test.only('WHEN we query the prompt evaluation model THEN it is initialised', async () => {
	mockFromTemplate.mockReturnValueOnce('' as unknown as PromptTemplate);
	// mockInitOpenAI.mockReturnValueOnce('' as unknown as OpenAI);

	await queryPromptEvaluationModel('some input', promptEvalPrompt);

	expect(mockFromTemplate).toHaveBeenCalledTimes(1);
	expect(mockFromTemplate).toHaveBeenCalledWith(
		`${promptEvalPrompt}\n${promptEvalContextTemplate}`
	);

	// check above three mocks were called with correct args
});

test('GIVEN the prompt evaluation model is not initialised WHEN it is asked to evaluate an input it returns not malicious', async () => {
	mockPromptEvalChain.call.mockResolvedValueOnce({ promptEvalOutput: '' });
	const result = await queryPromptEvaluationModel('message', 'Prompt');
	expect(result).toEqual({
		isMalicious: false,
	});
});

test('GIVEN the users api key supports GPT-4 WHEN the prompt evaluation model is initialised THEN it is initialised with GPT-4', async () => {
	mockValidModels = ['gpt-4', 'gpt-3.5-turbo', 'gpt-3'];

	const prompt = 'this is a test prompt. ';

	await queryPromptEvaluationModel('some input', prompt);

	expect(ChatOpenAI).toHaveBeenCalledWith({
		modelName: 'gpt-4',
		streaming: true,
		openAIApiKey: 'sk-12345',
	});
});

test('GIVEN the users api key does not support GPT-4 WHEN the prompt evaluation model is initialised THEN it is initialised with gpt-3.5-turbo', async () => {
	mockValidModels = ['gpt-2', 'gpt-3.5-turbo', 'gpt-3'];

	const prompt = 'this is a test prompt. ';

	await queryPromptEvaluationModel('some input', prompt);

	expect(ChatOpenAI).toHaveBeenCalledWith({
		modelName: 'gpt-3.5-turbo',
		streaming: true,
		openAIApiKey: 'sk-12345',
	});
});
