import { expect, jest, test, describe } from '@jest/globals';
import { Response } from 'express';

import { handleConfigureModel } from '@src/controller/modelController';
import { OpenAiConfigureModelRequest } from '@src/models/api/OpenAiConfigureModelRequest';
import { modelConfigIds } from '@src/models/chat';

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

	test('WHEN missing configId THEN does not configure model', () => {
		const req = {
			body: {
				value: 0.5,
			},
		} as OpenAiConfigureModelRequest;
		const res = responseMock();

		handleConfigureModel(req, res);

		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.send).toHaveBeenCalledWith('Missing configId');
	});

	test('WHEN configId is invalid THEN does not configure model', () => {
		const req = {
			body: {
				configId: 'invalid config id',
				value: 0.5,
			},
		} as OpenAiConfigureModelRequest;
		const res = responseMock();

		handleConfigureModel(req, res);

		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.send).toHaveBeenCalledWith('Invalid configId');
	});

	test('WHEN value is missing THEN does not configure model', () => {
		const req = {
			body: {
				configId: 'topP',
			},
		} as unknown as OpenAiConfigureModelRequest;
		const res = responseMock();

		handleConfigureModel(req, res);

		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.send).toHaveBeenCalledWith('Missing or invalid value');
	});

	test('WHEN value is invalid THEN does not configure model', () => {
		const req = {
			body: {
				configId: 'topP',
				value: 'invalid value',
			},
		} as unknown as OpenAiConfigureModelRequest;
		const res = responseMock();

		handleConfigureModel(req, res);

		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.send).toHaveBeenCalledWith('Missing or invalid value');
	});

	test.each(modelConfigIds)(
		'GIVEN configId is %s WHEN value is below range THEN does not configure model',
		(configId) => {
			const req = {
				body: {
					configId,
					value: -1,
				},
			} as unknown as OpenAiConfigureModelRequest;
			const res = responseMock();

			handleConfigureModel(req, res);

			const expectedMaxValue = configId === 'topP' ? 1 : 2;

			expect(res.status).toHaveBeenCalledWith(400);
			expect(res.send).toHaveBeenCalledWith(
				`Value should be between 0 and ${expectedMaxValue} for ${configId}`
			);
		}
	);

	test.each(modelConfigIds)(
		'GIVEN configId is %s WHEN value is above range THEN does not configure model',
		(configId) => {
			const expectedMaxValue = configId === 'topP' ? 1 : 2;

			const req = {
				body: {
					configId,
					value: expectedMaxValue + 1,
				},
			} as unknown as OpenAiConfigureModelRequest;
			const res = responseMock();

			handleConfigureModel(req, res);

			expect(res.status).toHaveBeenCalledWith(400);
			expect(res.send).toHaveBeenCalledWith(
				`Value should be between 0 and ${expectedMaxValue} for ${configId}`
			);
		}
	);
});
