import { Request, Response } from 'express';

import { levelsInitialState } from '@src/models/level';

function handleResetProgress(req: Request, res: Response) {
	console.debug('Resetting progress for all levels');
	req.session.levelState = levelsInitialState;
	res.send(req.session.levelState);
}

export { handleResetProgress };
