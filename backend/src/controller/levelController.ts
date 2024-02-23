import { Response } from 'express';

import { LevelGetRequest } from '@src/models/api/LevelGetRequest';

function handleLoadLevel(req: LevelGetRequest, res: Response) {
	const { level } = req.query;

	if (level === undefined) {
		res.status(400).send('Level not provided');
		return;
	}

	res.send({
		emails: req.session.levelState[level].sentEmails,
		chatHistory: req.session.levelState[level].chatHistory,
		defences: req.session.levelState[level].defences,
	});
}

export { handleLoadLevel };
