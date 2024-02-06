import { Request, Response } from 'express';

import { getInitialLevelStates } from '@src/models/level';

function handleResetProgress(req: Request, res: Response) {
	console.debug('Resetting progress for all levels', req.session.levelState);
	req.session.levelState = getInitialLevelStates();
	res.send(req.session.levelState);
}

export { handleResetProgress };
