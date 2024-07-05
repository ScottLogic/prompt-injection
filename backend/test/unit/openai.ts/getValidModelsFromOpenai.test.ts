import {
	beforeEach,
	afterEach,
	describe,
	expect,
	jest,
	test,
} from '@jest/globals';
import { OpenAI } from 'openai';

import { getValidModelsFromOpenAI } from '@src/openai';

jest.mock('openai');
jest.mock('@src/defence');

describe('getValidModelsFromOpenAI', () => {
	const mockListFn = jest.fn<OpenAI.Models['list']>();
	jest.mocked(OpenAI).mockImplementation(
		() =>
			({
				models: {
					list: mockListFn,
				},
			}) as unknown as jest.MockedObject<OpenAI>
	);

	beforeEach(() => {
		process.env = {};
	});

	afterEach(() => {
		mockListFn.mockReset();
	});

	test('GIVEN the user has an openAI key WHEN getValidModelsFromOpenAI is called THEN it returns only the models that are also in the CHAT_MODELS enum', async () => {
		process.env.OPENAI_API_KEY = 'sk-12345';
		const mockModelList = [
			{ id: 'gpt-3.5-turbo' },
			{ id: 'gpt-3.5-turbo-0613' },
			{ id: 'gpt-4' },
			{ id: 'gpt-4o' },
			{ id: 'da-vinci-1' },
			{ id: 'da-vinci-2' },
		];
		const expectedValidModels = ['gpt-3.5-turbo', 'gpt-4', 'gpt-4o'];

		mockListFn.mockResolvedValueOnce({
			data: mockModelList,
		} as OpenAI.ModelsPage);

		const validModels = await getValidModelsFromOpenAI();

		expect(validModels).toEqual(expectedValidModels);
	});

	test('GIVEN the user has no valid chat models available WHEN getValidModelsFromOpenAI is called THEN an error is thrown', async () => {
		process.env.OPENAI_API_KEY = 'sk-12345';
		const mockModelList = [
			{ id: 'gpt-3' },
			{ id: 'davinci-001' },
			{ id: 'davinci-002' },
			{ id: 'text-moderation-stable' },
			{ id: 'whisper-1' },
		];
		mockListFn.mockResolvedValueOnce({
			data: mockModelList,
		} as OpenAI.ModelsPage);

		await expect(getValidModelsFromOpenAI()).rejects.toThrow(
			'No chat models found'
		);
	});
});
