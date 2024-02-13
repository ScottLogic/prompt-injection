import { Response } from 'express';

import { LevelStateRequest } from '@src/models/api/LevelStateRequest';
import { LEVEL_NAMES } from '@src/models/level';
import { getValidOpenAIModelsList } from '@src/openai';
import {
	systemRoleLevel1,
	systemRoleLevel2,
	systemRoleLevel3,
} from '@src/promptTemplates';

function handleStart(req: LevelStateRequest, res: Response) {
	const level = req.query.level;

	// put level into the URL to ensure type safety

	const systemRoles = [
		{ level: LEVEL_NAMES.LEVEL_1, systemRole: systemRoleLevel1 },
		{ level: LEVEL_NAMES.LEVEL_2, systemRole: systemRoleLevel2 },
		{ level: LEVEL_NAMES.LEVEL_3, systemRole: systemRoleLevel3 },
	];

	res.send({
		emails: req.session.levelState[level].sentEmails,
		history: req.session.levelState[level].chatHistory,
		defences: req.session.levelState[level].defences,
		models: getValidOpenAIModelsList(),
		systemRoles,
	});
}

export { handleStart };
