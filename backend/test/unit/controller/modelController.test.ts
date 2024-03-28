import { expect, jest, test, describe } from '@jest/globals';
import { Response } from 'express';

import {
	handleConfigureModel,
	handleSetModel,
} from '@src/controller/modelController';
import { OpenAiConfigureModelRequest } from '@src/models/api/OpenAiConfigureModelRequest';
import { OpenAiSetModelRequest } from '@src/models/api/OpenAiSetModelRequest';
import { modelConfigIds } from '@src/models/chat';
import { ChatMessage } from '@src/models/chatMessage';
import { LEVEL_NAMES, LevelState } from '@src/models/level';

function responseMock() {
	return {
		send: jest.fn(),
		status: jest.fn().mockReturnThis(),
	} as unknown as Response;
}

describe('handleSetModel', () => {
	test('WHEN passed sensible parameters THEN sets model AND adds info message to chat history AND responds with info message', () => {
		const req = {
			body: {
				model: 'gpt-4',
			},
			session: {
				chatModel: {
					id: 'gpt-3.5-turbo',
				},
				levelState: [{}, {}, {}, { chatHistory: [] } as unknown as LevelState],
			},
		} as OpenAiSetModelRequest;
		const res = responseMock();

		handleSetModel(req, res);

		expect(req.session.chatModel.id).toBe('gpt-4');

		const expectedInfoMessage = {
			infoMessage: 'changed model to gpt-4',
			chatMessageType: 'GENERIC_INFO',
		} as ChatMessage;
		expect(
			req.session.levelState[LEVEL_NAMES.SANDBOX].chatHistory.at(-1)
		).toEqual(expectedInfoMessage);
		expect(res.send).toHaveBeenCalledWith({
			chatInfoMessage: expectedInfoMessage,
		});
	});

	test('WHEN missing model THEN does not set model', () => {
		const req = {
			body: {},
		} as OpenAiSetModelRequest;
		const res = responseMock();

		handleSetModel(req, res);

		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.send).toHaveBeenCalledWith('Missing model');
	});

	test('WHEN model is invalid THEN does not set model', () => {
		const req = {
			body: {
				model: 'invalid model',
			},
		} as unknown as OpenAiSetModelRequest;
		const res = responseMock();

		handleSetModel(req, res);

		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.send).toHaveBeenCalledWith('Invalid model');
	});
});

describe('handleConfigureModel', () => {
	test('WHEN passed sensible parameters THEN configures model AND adds info message to chat history AND responds with info message', () => {
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
				levelState: [{}, {}, {}, { chatHistory: [] } as unknown as LevelState],
			},
		} as OpenAiConfigureModelRequest;
		const res = responseMock();

		handleConfigureModel(req, res);

		expect(req.session.chatModel.configuration.topP).toBe(0.5);

		const expectedInfoMessage = {
			infoMessage: 'changed topP to 0.5',
			chatMessageType: 'GENERIC_INFO',
		} as ChatMessage;
		expect(
			req.session.levelState[LEVEL_NAMES.SANDBOX].chatHistory.at(-1)
		).toEqual(expectedInfoMessage);
		expect(res.send).toHaveBeenCalledWith({
			chatInfoMessage: expectedInfoMessage,
		});
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
