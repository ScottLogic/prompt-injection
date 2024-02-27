import { Response } from 'express';

import { StartGetRequest } from '@src/models/api/StartGetRequest';
import { ChatModel } from '@src/models/chat';
import { LEVEL_NAMES, LevelState } from '@src/models/level';
import { getValidOpenAIModels } from '@src/openai';
import {
	systemRoleLevel1,
	systemRoleLevel2,
	systemRoleLevel3,
} from '@src/promptTemplates';

import { sendErrorResponse } from './handleError';

declare module 'express-session' {
	interface Session {
		initialised: boolean;
		chatModel: ChatModel;
		levelState: LevelState[];
	}
}

function handleStart(req: StartGetRequest, res: Response) {
	const { level } = req.query;

	if (level === undefined) {
		sendErrorResponse(res, 400, 'Level not provided');
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
	});
}

export { handleStart };
