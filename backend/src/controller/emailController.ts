import { Response } from 'express';

import { EmailClearRequest } from '@src/models/api/EmailClearRequest';
import { LEVEL_NAMES } from '@src/models/level';

function handleClearEmails(req: EmailClearRequest, res: Response) {
	const level = req.body.level;
	if (level !== undefined && level >= LEVEL_NAMES.LEVEL_1) {
		req.session.levelState[level].sentEmails = [];
		console.debug('Emails cleared');
		res.send();
	} else {
		res.status(400);
		res.send();
	}
}

export { handleClearEmails };
