import { describe, test, expect, jest } from '@jest/globals';
import { RetrievalQAChain } from 'langchain/chains';

import { queryPromptEvaluationModel } from '@src/langchain';

const mockRetrievalQAChain = {
	call: jest.fn<() => Promise<{ text: string }>>(),
};
const mockPromptEvalChain = {
	call: jest.fn<() => Promise<{ promptEvalOutput: string }>>(),
};
const mockFromLLM = jest.fn<() => typeof mockRetrievalQAChain>();

// mock chains
jest.mock('langchain/chains', () => {
	return {
		RetrievalQAChain: jest.fn().mockImplementation(() => {
			return mockRetrievalQAChain;
		}),
		LLMChain: jest.fn().mockImplementation(() => {
			return mockPromptEvalChain;
		}),
	};
});
RetrievalQAChain.fromLLM =
	mockFromLLM as unknown as typeof RetrievalQAChain.fromLLM;

describe('queryPromptEvaluationModel output formatter (formatEvaluationOutput)', () => {
	test('GIVEN prompt evaluation llm responds with a correctly formatted yes decision WHEN we query the llm THEN we get an answer in the correct format', async () => {
		mockPromptEvalChain.call.mockResolvedValue({
			promptEvalOutput: 'yes.',
		});
		const formattedOutput = await queryPromptEvaluationModel('input', 'prompt');

		expect(formattedOutput).toEqual({
			isMalicious: true,
		});
	});

	test('GIVEN prompt evaluation llm responds with a correctly formatted no decision WHEN we query the llm THEN we get an answer in the correct format', async () => {
		mockPromptEvalChain.call.mockResolvedValue({
			promptEvalOutput: 'no.',
		});
		const formattedOutput = await queryPromptEvaluationModel('input', 'prompt');

		expect(formattedOutput).toEqual({
			isMalicious: false,
		});
	});
});
