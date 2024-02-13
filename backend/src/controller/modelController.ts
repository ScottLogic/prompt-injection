import { Response } from 'express';

import { OpenAIGetModelRequest } from '@src/models/api/OpenAIGetModelRequest';
import { OpenAiConfigureModelRequest } from '@src/models/api/OpenAiConfigureModelRequest';
import { OpenAiSetModelRequest } from '@src/models/api/OpenAiSetModelRequest';
import { MODEL_CONFIG } from '@src/models/chat';

function handleSetModel(req: OpenAiSetModelRequest, res: Response) {
	const { model } = req.body;

	if (model === undefined) {
		res.status(400).send();
	} else {
		const configuration =
			req.body.configuration ?? req.session.chatModel.configuration;
		req.session.chatModel = { id: model, configuration };
		console.debug('GPT model set:', JSON.stringify(req.session.chatModel));
		res.status(200).send();
	}
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
