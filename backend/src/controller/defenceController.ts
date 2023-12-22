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
	const defenceId = req.body.defenceId;
	const level = req.body.level;

	if (defenceId && level !== undefined) {
		// activate the defence
		req.session.levelState[level].defences = activateDefence(
			defenceId,
			req.session.levelState[level].defences
		);
		res.status(200).send();
	} else {
		res.status(400).send();
	}
}

function handleDefenceDeactivation(req: DefenceActivateRequest, res: Response) {
	// id of the defence
	const defenceId = req.body.defenceId;
	const level = req.body.level;
	if (defenceId && level !== undefined) {
		// deactivate the defence
		req.session.levelState[level].defences = deactivateDefence(
			defenceId,
			req.session.levelState[level].defences
		);
		res.send();
	} else {
		res.status(400);
		res.send();
	}
}

function handleConfigureDefence(req: DefenceConfigureRequest, res: Response) {
	// id of the defence
	const defenceId = req.body.defenceId;
	const config = req.body.config;
	const level = req.body.level;

	if (!defenceId || !config || level === undefined) {
		sendErrorResponse(res, 400, 'Missing defenceId, config or level');
		return;
	}

	if (configValueExceedsCharacterLimit(config)) {
		sendErrorResponse(res, 400, 'Config value exceeds character limit');
		return;
	}

	// configure the defence
	req.session.levelState[level].defences = configureDefence(
		defenceId,
		req.session.levelState[level].defences,
		config
	);
	res.send();
}

function handleResetSingleDefence(
	req: DefenceConfigResetRequest,
	res: Response
) {
	const defenceId = req.body.defenceId;
	const configId = req.body.configId;
	const level = LEVEL_NAMES.SANDBOX; //configuration only available in sandbox
	if (defenceId && configId) {
		req.session.levelState[level].defences = resetDefenceConfig(
			defenceId,
			configId,
			req.session.levelState[level].defences
		);
		const updatedDefenceConfig: DefenceConfigItem | undefined =
			req.session.levelState[level].defences
				.find((defence) => defence.id === defenceId)
				?.config.find((config) => config.id === configId);

		if (updatedDefenceConfig) {
			res.send(updatedDefenceConfig);
		} else {
			res.status(400);
			res.send();
		}
	} else {
		res.status(400);
		res.send();
	}
}

function handleGetDefenceStatus(req: DefenceStatusRequest, res: Response) {
	const level: number | undefined = req.query.level as number | undefined;
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
