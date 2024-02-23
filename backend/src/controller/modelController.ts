import { Response } from 'express';

import { OpenAIGetModelRequest } from '@src/models/api/OpenAIGetModelRequest';
import { OpenAiConfigureModelRequest } from '@src/models/api/OpenAiConfigureModelRequest';
import { OpenAiSetModelRequest } from '@src/models/api/OpenAiSetModelRequest';
import { MODEL_CONFIG } from '@src/models/chat';
import { LEVEL_NAMES } from '@src/models/level';

import { sendErrorResponse } from './handleError';

function handleSetModel(req: OpenAiSetModelRequest, res: Response) {
	const { model } = req.body;
	const { level } = req.query;

	if (model === undefined) {
		sendErrorResponse(res, 400, 'Model not provided');
		return;
	}

	if (level === undefined) {
		sendErrorResponse(res, 400, 'Level not provided');
		return;
	}

	if (level < LEVEL_NAMES.LEVEL_1 || level > LEVEL_NAMES.SANDBOX) {
		sendErrorResponse(res, 400, 'Invalid level');
		return;
	}

	if (req.session.levelState[level].chatModel === undefined) {
		sendErrorResponse(
			res,
			400,
			'Cannot changethe chat model in this level, since it uses the default'
		);
		return;
	}

	if (req.session.levelState[3].chatModel === undefined) return; // need this for now because of nuisance level enum

	const configuration =
		req.body.configuration ?? req.session.levelState[3].chatModel.configuration;
	req.session.levelState[3].chatModel = { id: model, configuration };
	console.debug(
		'GPT model set:',
		JSON.stringify(req.session.levelState[3].chatModel)
	);
	res.status(200).send();
}

function handleConfigureModel(req: OpenAiConfigureModelRequest, res: Response) {
	const configId = req.body.configId as MODEL_CONFIG | undefined;
	const value = req.body.value;
	const maxValue = configId === MODEL_CONFIG.TOP_P ? 1 : 2;

	if (configId && value !== undefined && value >= 0 && value <= maxValue) {
		req.session.chatModel.configuration[configId] = value;
		res.status(200).send();
	} else {
		res.status(400).send();
	}
}

function handleGetModel(req: OpenAIGetModelRequest, res: Response) {
	res.send(req.session.chatModel);
}

export { handleSetModel, handleConfigureModel, handleGetModel };
