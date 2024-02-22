import { Response } from 'express';

import { LevelGetRequest } from '@src/models/api/LevelGetRequest';

function handleLoadLevel(req: LevelGetRequest, res: Response) {
	const { level } = req.query;

	res.send({
		emails: req.session.levelState[level].sentEmails,
		chatHistory: req.session.levelState[level].chatHistory,
		defences: req.session.levelState[level].defences,
	});
}

export { handleLoadLevel };
