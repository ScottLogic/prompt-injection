import { Response } from 'express';

import { sendErrorResponse } from '@src/controller/handleError';
import { isValidLevel, LEVEL_NAMES } from '@src/models/level';

export function validateLevel(response: Response, level?: LEVEL_NAMES) {
	if (level === undefined) {
		sendErrorResponse(response, 400, 'Level not provided');
		return null;
	}

	if (!isValidLevel(level)) {
		sendErrorResponse(response, 400, 'Invalid level');
		return null;
	}

	return level;
}
