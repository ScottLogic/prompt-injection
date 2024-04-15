import { beforeAll, describe, expect, it, jest } from '@jest/globals';
import { OpenAI } from 'openai';
import request from 'supertest';

import { StartResponse } from '@src/models/api/StartGetRequest';
import { LEVEL_NAMES } from '@src/models/level';
import app from '@src/server/app';

jest.mock('openai');

const PATH = '/api/start';

describe('/start endpoints', () => {
	const mockListFn = jest.fn<OpenAI.Models['list']>();
	jest.mocked(OpenAI).mockImplementation(
		() =>
			({
				models: {
					list: mockListFn,
				},
			}) as unknown as jest.MockedObject<OpenAI>
	);

	beforeAll(() => {
		mockListFn.mockResolvedValue({
			data: [{ id: 'gpt-3.5-turbo' }],
		} as OpenAI.ModelsPage);
	});

	it.each(Object.values(LEVEL_NAMES))(
		'WHEN given valid level [%s] THEN it responds with 200',
		async (level) =>
			request(app)
				.get(`${PATH}?level=${level}`)
				.expect(200)
				.expect('Content-Type', /application\/json/)
				.then((response) => {
					const { chatHistory, emails } = response.body as StartResponse;
					expect(chatHistory).toEqual([]);
					expect(emails).toEqual([]);
				})
	);

	it.each([-1, 4, 'SANDBOX'])(
		'WHEN given invalid level [%s] THEN it responds with 400',
		async (level) =>
			request(app)
				.get(`${PATH}?level=${level}`)
				.expect(400)
				.then((response) => {
					expect(response.text).toEqual('Invalid level');
				})
	);
});
