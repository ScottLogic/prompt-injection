import { Response } from 'express';

import {
	StartGetRequest,
	StartResponse,
} from '@src/models/api/StartGetRequest';
import { LEVEL_NAMES, isValidLevel } from '@src/models/level';
import { getValidOpenAIModels } from '@src/openai';
import {
	systemRoleLevel1,
	systemRoleLevel2,
	systemRoleLevel3,
} from '@src/promptTemplates';

import { sendErrorResponse } from './handleError';

function handleStart(req: StartGetRequest, res: Response) {
	const { level } = req.query;

	if (level === undefined) {
		sendErrorResponse(res, 400, 'Level not provided');
		return;
	}

	if (!isValidLevel(level)) {
		sendErrorResponse(res, 400, 'Invalid level');
		return;
	}

	const systemRoles = [
		{ level: LEVEL_NAMES.LEVEL_1, systemRole: systemRoleLevel1 },
		{ level: LEVEL_NAMES.LEVEL_2, systemRole: systemRoleLevel2 },
		{ level: LEVEL_NAMES.LEVEL_3, systemRole: systemRoleLevel3 },
	];

	res.send({
		emails: req.session.levelState[level].sentEmails,
		chatHistory: req.session.levelState[level].chatHistory,
		defences: req.session.levelState[level].defences,
		availableModels: getValidOpenAIModels(),
		systemRoles,
		chatModel:
			level === LEVEL_NAMES.SANDBOX ? req.session.chatModel : undefined,
	} as StartResponse);
}

export { handleStart };
