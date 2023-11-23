import { Request } from 'express';

import { LEVEL_NAMES } from '@src/models/level';

export type LevelGetPromptRequest = Request<
	never,
	string,
	never,
	{
		level?: LEVEL_NAMES;
	}
>;
