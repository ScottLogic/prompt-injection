import { Response } from 'express';

import { getSandboxDocumentMetas } from '@src/document';
import {
	StartGetRequest,
	StartGetResponseBody,
} from '@src/models/api/StartGetRequest';
import { LEVEL_NAMES } from '@src/models/level';
import { getValidOpenAIModels } from '@src/openai';
import {
	systemRoleLevel1,
	systemRoleLevel2,
	systemRoleLevel3,
} from '@src/promptTemplates';

import { validateLevel } from './requestValidators';

function handleStart(
	req: StartGetRequest,
	res: Response<StartGetResponseBody>
) {
	const level = validateLevel(res, req.query.level);
	if (level === null) return;

	const chatModel =
		level === LEVEL_NAMES.SANDBOX ? req.session.chatModel : undefined;
	const availableDocs =
		level === LEVEL_NAMES.SANDBOX ? getSandboxDocumentMetas() : undefined;
	const systemRoles = [
		{ level: LEVEL_NAMES.LEVEL_1, systemRole: systemRoleLevel1 },
		{ level: LEVEL_NAMES.LEVEL_2, systemRole: systemRoleLevel2 },
		{ level: LEVEL_NAMES.LEVEL_3, systemRole: systemRoleLevel3 },
	];

	res.send({
		emails: req.session.levelState[level].sentEmails,
		chatHistory: req.session.levelState[level].chatHistory,
		defences: req.session.levelState[level].defences,
		chatModel,
		availableDocs,
		availableModels: getValidOpenAIModels(),
		systemRoles,
	});
}

export { handleStart };
