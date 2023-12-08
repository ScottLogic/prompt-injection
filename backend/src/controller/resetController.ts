import { Request, Response } from 'express';

import { LEVEL_NAMES, levelsInitialState } from '@src/models/level';

function handleResetProgress(req: Request, res: Response) {
	console.debug('Resetting progress for all levels', req.session.levelState);
	// keep track of sandbox state to preserve defences
	const sandboxDefenceState =
		req.session.levelState[LEVEL_NAMES.SANDBOX].defences;
	req.session.levelState = { ...levelsInitialState };
	req.session.levelState[LEVEL_NAMES.SANDBOX].defences = sandboxDefenceState;
	res.send(req.session.levelState);
}

export { handleResetProgress };
