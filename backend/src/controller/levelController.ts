import { Response } from 'express';

import { getSandboxDocumentMetas } from '@src/document';
import { LevelGetRequest } from '@src/models/api/LevelGetRequest';
import { LEVEL_NAMES } from '@src/models/level';

import { validateLevel } from './requestValidators';

function handleLoadLevel(req: LevelGetRequest, res: Response) {
	const level = validateLevel(res, req.query.level);
	if (level === null) return;

	const chatModel =
		level === LEVEL_NAMES.SANDBOX ? req.session.chatModel : undefined;
	const availableDocs =
		level === LEVEL_NAMES.SANDBOX ? getSandboxDocumentMetas() : undefined;

	res.send({
		emails: req.session.levelState[level].sentEmails,
		chatHistory: req.session.levelState[level].chatHistory,
		defences: req.session.levelState[level].defences,
		chatModel,
		availableDocs,
	});
}

export { handleLoadLevel };
