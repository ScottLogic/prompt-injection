import { PromptTemplate } from 'langchain/prompts';

import { makePromptTemplate } from '@src/langchain';

jest.mock('langchain/prompts', () => ({
	PromptTemplate: {
		fromTemplate: jest.fn(),
	},
}));

describe('Langchain tests', () => {
	afterEach(() => {
		(PromptTemplate.fromTemplate as jest.Mock).mockRestore();
	});

	test('GIVEN makePromptTemplate is called with no config Prompt THEN correct prompt is returned', () => {
		makePromptTemplate('', 'defaultPrompt', 'mainPrompt', 'noName');
		expect(PromptTemplate.fromTemplate as jest.Mock).toHaveBeenCalledTimes(1);
		expect(PromptTemplate.fromTemplate as jest.Mock).toHaveBeenCalledWith(
			'defaultPrompt\nmainPrompt'
		);
	});

	test('GIVEN makePromptTemplate is called with a Prompt THEN correct prompt is returned', () => {
		makePromptTemplate('configPrompt', 'defaultPrompt', 'mainPrompt', 'noName');
		expect(PromptTemplate.fromTemplate as jest.Mock).toHaveBeenCalledTimes(1);
		expect(PromptTemplate.fromTemplate as jest.Mock).toHaveBeenCalledWith(
			'configPrompt\nmainPrompt'
		);
	});
});
