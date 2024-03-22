import { expect, jest, test, describe } from '@jest/globals';
import { Response } from 'express';

import { handleConfigureModel } from '@src/controller/modelController';
import { OpenAiConfigureModelRequest } from '@src/models/api/OpenAiConfigureModelRequest';

function responseMock() {
	return {
		send: jest.fn(),
		status: jest.fn().mockReturnThis(),
	} as unknown as Response;
}

describe('handleConfigureModel', () => {
	test('WHEN passed sensible parameters THEN configures model', () => {
		const req = {
			body: {
				configId: 'topP',
				value: 0.5,
			},
			session: {
				chatModel: {
					configuration: {
						temperature: 0.0,
						topP: 0.0,
						presencePenalty: 0.0,
						frequencyPenalty: 0.0,
					},
				},
			},
		} as OpenAiConfigureModelRequest;
		const res = responseMock();

		handleConfigureModel(req, res);

		expect(res.status).toHaveBeenCalledWith(200);
		expect(req.session.chatModel.configuration.topP).toBe(0.5);
	});

	// then all unhappy paths
});
