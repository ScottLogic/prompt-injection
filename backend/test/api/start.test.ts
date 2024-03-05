import { it, describe, expect } from '@jest/globals';
import request from 'supertest';

import app from '@src/app';
import { StartResponse } from '@src/models/api/StartGetRequest';
import { LEVEL_NAMES } from '@src/models/level';

const PATH = '/start';

describe('/start endpoints', () => {
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
