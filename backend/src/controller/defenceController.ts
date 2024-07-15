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
import { ChatInfoMessage } from '@src/models/chatMessage';
import { DefenceConfigItem } from '@src/models/defence';
import { LEVEL_NAMES, isValidLevel } from '@src/models/level';
import { pushMessageToHistory } from '@src/utils/chat';

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

	if (!Number.isFinite(level) || level === undefined) {
		sendErrorResponse(res, 400, 'Missing level');
		return;
	}

	if (!isValidLevel(level)) {
		sendErrorResponse(res, 400, 'Invalid level');
		return;
	}

	const currentDefences = req.session.levelState[level].defences;

	if (!currentDefences) {
		sendErrorResponse(res, 400, 'You cannot activate defences on this level');
		return;
	}

	if (!currentDefences.some((defence) => defence.id === defenceId)) {
		sendErrorResponse(res, 400, `Defence with id ${defenceId} not found`);
		return;
	}

	req.session.levelState[level].defences = activateDefence(
		defenceId,
		currentDefences
	);

	const displayedDefenceId = defenceId.replace(/_/g, ' ').toLowerCase();
	const chatInfoMessage = {
		infoMessage: `${displayedDefenceId} defence activated`,
		chatMessageType: 'GENERIC_INFO',
	} as ChatInfoMessage;

	req.session.levelState[level].chatHistory = pushMessageToHistory(
		req.session.levelState[level].chatHistory,
		chatInfoMessage
	);

	res.send({
		chatInfoMessage,
	});
}

function handleDefenceDeactivation(req: DefenceActivateRequest, res: Response) {
	const { defenceId, level } = req.body;

	if (!defenceId) {
		sendErrorResponse(res, 400, 'Missing defenceId');
		return;
	}

	if (!Number.isFinite(level) || level === undefined) {
		sendErrorResponse(res, 400, 'Missing level');
		return;
	}

	if (!isValidLevel(level)) {
		sendErrorResponse(res, 400, 'Invalid level');
		return;
	}

	const currentDefences = req.session.levelState[level].defences;

	if (!currentDefences) {
		sendErrorResponse(res, 400, 'You cannot deactivate defences on this level');
		return;
	}

	if (!currentDefences.some((defence) => defence.id === defenceId)) {
		sendErrorResponse(res, 400, `Defence with id ${defenceId} not found`);
		return;
	}

	req.session.levelState[level].defences = deactivateDefence(
		defenceId,
		currentDefences
	);

	const displayedDefenceId = defenceId.replace(/_/g, ' ').toLowerCase();
	const chatInfoMessage = {
		infoMessage: `${displayedDefenceId} defence deactivated`,
		chatMessageType: 'GENERIC_INFO',
	} as ChatInfoMessage;

	req.session.levelState[level].chatHistory = pushMessageToHistory(
		req.session.levelState[level].chatHistory,
		chatInfoMessage
	);

	res.send({
		chatInfoMessage,
	});
}

function handleConfigureDefence(req: DefenceConfigureRequest, res: Response) {
	const { defenceId, level, config } = req.body;

	if (!defenceId) {
		sendErrorResponse(res, 400, 'Missing defenceId');
		return;
	}

	if (!Number.isFinite(level) || level === undefined) {
		sendErrorResponse(res, 400, 'Missing level');
		return;
	}

	if (!isValidLevel(level)) {
		sendErrorResponse(res, 400, 'Invalid level');
		return;
	}

	if (!config) {
		sendErrorResponse(res, 400, 'Missing config');
		return;
	}

	if (configValueExceedsCharacterLimit(config)) {
		sendErrorResponse(res, 400, 'Config value exceeds character limit');
		return;
	}

	const currentDefences = req.session.levelState[level].defences;

	if (!currentDefences || level !== LEVEL_NAMES.SANDBOX) {
		sendErrorResponse(res, 400, 'You cannot configure defences on this level');
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

	const displayedDefenceId = defenceId.replace(/_/g, ' ').toLowerCase();
	const chatInfoMessage = {
		infoMessage: `${displayedDefenceId} defence updated`,
		chatMessageType: 'GENERIC_INFO',
	} as ChatInfoMessage;

	req.session.levelState[level].chatHistory = pushMessageToHistory(
		req.session.levelState[level].chatHistory,
		chatInfoMessage
	);

	res.send({
		chatInfoMessage,
	});
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

	if (!Number.isFinite(level) || level === undefined) {
		sendErrorResponse(res, 400, 'Missing level');
		return;
	}

	if (!isValidLevel(level)) {
		sendErrorResponse(res, 400, 'Invalid level');
		return;
	}

	const currentDefences = req.session.levelState[level].defences;

	if (!currentDefences || level !== LEVEL_NAMES.SANDBOX) {
		sendErrorResponse(
			res,
			400,
			'You cannot reset defence config items on this level'
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

	const updatedDefence = req.session.levelState[level].defences.find(
		(defence) => defence.id === defenceId
	);
	if (!updatedDefence) {
		sendErrorResponse(res, 500, 'Something went whacky');
		return;
	}
	const updatedDefenceConfig = updatedDefence.config.find(
		(config) => config.id === configItemId
	);

	res.send(updatedDefenceConfig);
}

export {
	handleDefenceActivation,
	handleDefenceDeactivation,
	handleConfigureDefence,
	handleResetDefenceConfigItem,
};
