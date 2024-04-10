import { Response } from 'express';

import { LevelGetRequest } from '@src/models/api/LevelGetRequest';
import { LEVEL_NAMES, isValidLevel } from '@src/models/level';

function handleLoadLevel(req: LevelGetRequest, res: Response) {
	const { level } = req.query;

	if (level === undefined) {
		res.status(400).send('Level not provided');
		return;
	}

	if (!isValidLevel(level)) {
		res.status(400).send('Invalid level');
		return;
	}

	res.send({
		emails: req.session.levelState[level].sentEmails,
		chatHistory: req.session.levelState[level].chatHistory,
		defences: req.session.levelState[level].defences,
		chatModel:
			level === LEVEL_NAMES.SANDBOX ? req.session.chatModel : undefined,
	});
}

export { handleLoadLevel };
