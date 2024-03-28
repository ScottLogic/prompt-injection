import { Response } from 'express';

import { OpenAiConfigureModelRequest } from '@src/models/api/OpenAiConfigureModelRequest';
import { OpenAiSetModelRequest } from '@src/models/api/OpenAiSetModelRequest';
import {
	MODEL_CONFIG_ID,
	chatModelIds,
	modelConfigIds,
} from '@src/models/chat';
import { ChatInfoMessage } from '@src/models/chatMessage';
import { LEVEL_NAMES } from '@src/models/level';
import { pushMessageToHistory } from '@src/utils/chat';

import { sendErrorResponse } from './handleError';

function handleSetModel(req: OpenAiSetModelRequest, res: Response) {
	const { model } = req.body;

	if (model === undefined) {
		sendErrorResponse(res, 400, 'Missing model');
		return;
	}

	if (!chatModelIds.includes(model)) {
		sendErrorResponse(res, 400, 'Invalid model');
		return;
	}

	const configuration =
		req.body.configuration ?? req.session.chatModel.configuration;
	req.session.chatModel = { id: model, configuration };
	console.debug('GPT model set:', JSON.stringify(req.session.chatModel));

	const chatInfoMessage = {
		infoMessage: `changed model to ${model}`,
		chatMessageType: 'GENERIC_INFO',
	} as ChatInfoMessage;
	// for now, the chat model only changes in the sandbox level
	req.session.levelState[LEVEL_NAMES.SANDBOX].chatHistory =
		pushMessageToHistory(
			req.session.levelState[LEVEL_NAMES.SANDBOX].chatHistory,
			chatInfoMessage
		);

	req.res?.status(200).send({ chatInfoMessage });
}

function handleConfigureModel(req: OpenAiConfigureModelRequest, res: Response) {
	const configId = req.body.configId as MODEL_CONFIG_ID | undefined;
	const value = req.body.value;

	if (!configId) {
		sendErrorResponse(res, 400, 'Missing configId');
		return;
	}

	if (!modelConfigIds.includes(configId)) {
		sendErrorResponse(res, 400, 'Invalid configId');
		return;
	}

	if (!Number.isFinite(value) || value === undefined) {
		sendErrorResponse(res, 400, 'Missing or invalid value');
		return;
	}

	const maxValue = configId === 'topP' ? 1 : 2;

	if (value < 0 || value > maxValue) {
		sendErrorResponse(
			res,
			400,
			`Value should be between 0 and ${maxValue} for ${configId}`
		);
		return;
	}

	req.session.chatModel.configuration[configId] = value;

	const chatInfoMessage = {
		infoMessage: `changed ${configId} to ${value}`,
		chatMessageType: 'GENERIC_INFO',
	} as ChatInfoMessage;
	// for now, the chat model only changes in the sandbox level
	req.session.levelState[LEVEL_NAMES.SANDBOX].chatHistory =
		pushMessageToHistory(
			req.session.levelState[LEVEL_NAMES.SANDBOX].chatHistory,
			chatInfoMessage
		);

	req.res?.status(200).send({ chatInfoMessage });
}

export { handleSetModel, handleConfigureModel };
