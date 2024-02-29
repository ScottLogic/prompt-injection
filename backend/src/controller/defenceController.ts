import { Response } from 'express';

import {
	activateDefence,
	configureDefence,
	deactivateDefence,
	resetDefenceConfig,
} from '@src/defence';
import { DefenceActivateRequest } from '@src/models/api/DefenceActivateRequest';
import { DefenceConfigItemResetRequest } from '@src/models/api/DefenceConfigResetRequest';
import { DefenceConfigureRequest } from '@src/models/api/DefenceConfigureRequest';
import { DefenceStatusRequest } from '@src/models/api/DefenceStatusRequest';
import { DefenceConfigItem } from '@src/models/defence';
import { LEVEL_NAMES } from '@src/models/level';

import { sendErrorResponse } from './handleError';

function configValueExceedsCharacterLimit(config: DefenceConfigItem[]) {
	const CONFIG_VALUE_CHARACTER_LIMIT = 5000;

	const allValuesWithinLimit = config.every(
		(c) => c.value.length <= CONFIG_VALUE_CHARACTER_LIMIT
	);
	return !allValuesWithinLimit;
}

function handleDefenceActivation(req: DefenceActivateRequest, res: Response) {
	const { defenceId, level } = req.body;

	if (!defenceId) {
		sendErrorResponse(res, 400, 'Missing defenceId');
		return;
	}

	if (level === undefined) {
		sendErrorResponse(res, 400, 'Missing level');
		return;
	}

	if (level < LEVEL_NAMES.LEVEL_1 || level > LEVEL_NAMES.SANDBOX) {
		sendErrorResponse(res, 400, 'Invalid level');
		return;
	}

	const currentDefences = req.session.levelState[level].defences;

	if (currentDefences === undefined) {
		sendErrorResponse(
			res,
			400,
			'You cannot activate defences on this level, because it uses the default defences'
		);
		return;
	}

	const defence = currentDefences.find((defence) => defence.id === defenceId);

	if (defence === undefined) {
		sendErrorResponse(res, 400, `Defence with id ${defenceId} not found`);
		return;
	}

	req.session.levelState[level].defences = activateDefence(
		defenceId,
		currentDefences
	);
	res.status(200).send();
}

function handleDefenceDeactivation(req: DefenceActivateRequest, res: Response) {
	const { defenceId, level } = req.body;

	if (!defenceId) {
		sendErrorResponse(res, 400, 'Missing defenceId');
		return;
	}

	if (level === undefined) {
		sendErrorResponse(res, 400, 'Missing level');
		return;
	}

	if (level < LEVEL_NAMES.LEVEL_1 || level > LEVEL_NAMES.SANDBOX) {
		sendErrorResponse(res, 400, 'Invalid level');
		return;
	}

	const currentDefences = req.session.levelState[level].defences;

	if (currentDefences === undefined) {
		sendErrorResponse(
			res,
			400,
			'You cannot deactivate defences on this level, because it uses the default defences'
		);
		return;
	}

	const defence = currentDefences.find((defence) => defence.id === defenceId);

	if (defence === undefined) {
		sendErrorResponse(res, 400, `Defence with id ${defenceId} not found`);
		return;
	}

	req.session.levelState[level].defences = deactivateDefence(
		defenceId,
		currentDefences
	);
	res.status(200).send();
}

function handleConfigureDefence(req: DefenceConfigureRequest, res: Response) {
	const { defenceId, level, config } = req.body;

	if (defenceId === undefined) {
		sendErrorResponse(res, 400, 'Missing defenceId');
		return;
	}

	if (level === undefined) {
		sendErrorResponse(res, 400, 'Missing level');
		return;
	}

	if (level < LEVEL_NAMES.LEVEL_1 || level > LEVEL_NAMES.SANDBOX) {
		sendErrorResponse(res, 400, 'Invalid level');
		return;
	}

	if (config === undefined) {
		sendErrorResponse(res, 400, 'Missing config');
		return;
	}

	if (configValueExceedsCharacterLimit(config)) {
		sendErrorResponse(res, 400, 'Config value exceeds character limit');
		return;
	}

	const currentDefences = req.session.levelState[level].defences;

	if (currentDefences === undefined) {
		sendErrorResponse(
			res,
			400,
			'You cannot configure defences on this level, because it uses the default defences'
		);
		return;
	}

	const defence = currentDefences.find((defence) => defence.id === defenceId);

	if (defence === undefined) {
		sendErrorResponse(res, 400, `Defence with id ${defenceId} not found`);
		return;
	}

	req.session.levelState[level].defences = configureDefence(
		defenceId,
		currentDefences,
		config
	);
	res.send();
}

function handleResetDefenceConfigItem(
	req: DefenceConfigItemResetRequest,
	res: Response
) {
	const { defenceId, configItemId, level } = req.body;

	if (!defenceId) {
		sendErrorResponse(res, 400, 'Missing defenceId');
		return;
	}

	if (!configItemId) {
		sendErrorResponse(res, 400, 'Missing configId');
		return;
	}

	if (level === undefined) {
		sendErrorResponse(res, 400, 'Missing level');
		return;
	}

	if (level < LEVEL_NAMES.LEVEL_1 || level > LEVEL_NAMES.SANDBOX) {
		sendErrorResponse(res, 400, 'Invalid level');
		return;
	}

	const currentDefences = req.session.levelState[level].defences;

	if (currentDefences === undefined) {
		sendErrorResponse(
			res,
			400,
			'You cannot reset defences on this level, because it uses the default defences'
		);
		return;
	}

	const defence = currentDefences.find((defence) => defence.id === defenceId);

	if (defence === undefined) {
		sendErrorResponse(res, 400, `Defence with id ${defenceId} not found`);
		return;
	}

	const configItem = defence.config.find(
		(configItem) => configItem.id === configItemId
	);

	if (configItem === undefined) {
		sendErrorResponse(
			res,
			400,
			`Config item with id ${configItemId} not found for defence with id ${defenceId}`
		);
		return;
	}

	req.session.levelState[level].defences = resetDefenceConfig(
		defenceId,
		configItemId,
		currentDefences
	);

	const updatedDefenceConfig: DefenceConfigItem | undefined = currentDefences
		.find((defence) => defence.id === defenceId)
		?.config.find((config) => config.id === configItemId);

	res.send(updatedDefenceConfig);
}

function handleGetDefenceStatus(req: DefenceStatusRequest, res: Response) {
	const level = req.query.level;

	if (level === undefined) {
		sendErrorResponse(res, 400, 'Missing level');
		return;
	}

	if (level < LEVEL_NAMES.LEVEL_1 || level > LEVEL_NAMES.SANDBOX) {
		sendErrorResponse(res, 400, 'Invalid level');
		return;
	}

	res.send(req.session.levelState[level].defences);
}

export {
	handleDefenceActivation,
	handleDefenceDeactivation,
	handleConfigureDefence,
	handleResetDefenceConfigItem as handleResetSingleDefence,
	handleGetDefenceStatus,
};
