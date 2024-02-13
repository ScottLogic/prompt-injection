import { Response } from 'express';

import { LevelStateRequest } from '@src/models/api/LevelStateRequest';

function handleGetLevelState(req: LevelStateRequest, res: Response) {
	const level = req.query.level;

	// put level into the URL to ensure type safety

	res.send({
		emails: req.session.levelState[level].sentEmails,
		history: req.session.levelState[level].chatHistory,
		defences: req.session.levelState[level].defences,
	});
}

export { handleGetLevelState };
