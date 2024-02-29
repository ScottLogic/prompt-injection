import { Response } from 'express';

import {
	activateDefence,
	configureDefence,
	deactivateDefence,
	resetDefenceConfig,
} from '@src/defence';
import { DefenceActivateRequest } from '@src/models/api/DefenceActivateRequest';
import { DefenceConfigResetRequest } from '@src/models/api/DefenceConfigResetRequest';
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

	const configItem = defence.config.find(
		(configItem) => configItem.id === config[0].id
	);

	if (configItem === undefined) {
		sendErrorResponse(
			res,
			400,
			`Config with id ${config[0].id} not found for defence with id ${defenceId}`
		);
		return;
	}

	req.session.levelState[3].defences = configureDefence(
		defenceId,
		currentDefences,
		config
	);
	res.send();
}

function handleResetSingleDefence(
	req: DefenceConfigResetRequest,
	res: Response
) {
	const { defenceId, configId } = req.body;
	const level = LEVEL_NAMES.SANDBOX; //configuration only available in sandbox (interesting that we force that here, but not in the above endpoints)

	if (!defenceId) {
		sendErrorResponse(res, 400, 'Missing defenceId');
		return;
	}

	if (!configId) {
		sendErrorResponse(res, 400, 'Missing configId');
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

	req.session.levelState[level].defences = resetDefenceConfig(
		defenceId,
		configId,
		currentDefences
	);

	const updatedDefenceConfig: DefenceConfigItem | undefined =
		req.session.levelState[level].defences
			.find((defence) => defence.id === defenceId)
			?.config.find((config) => config.id === configId);

	if (updatedDefenceConfig) {
		res.send(updatedDefenceConfig);
	} else {
		res.status(400);
		res.send(
			"something went wrong while resetting the defence's config. Check the defenceId and configId."
		);
	}
}

function handleGetDefenceStatus(req: DefenceStatusRequest, res: Response) {
	const level = req.query.level as number | undefined;
	if (level !== undefined) {
		res.send(req.session.levelState[level].defences);
	} else {
		res.status(400);
		res.send('Missing level');
	}
}

export {
	handleDefenceActivation,
	handleDefenceDeactivation,
	handleConfigureDefence,
	handleResetSingleDefence,
	handleGetDefenceStatus,
};
