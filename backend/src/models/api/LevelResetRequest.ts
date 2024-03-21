import { Request } from 'express';

import { LEVEL_NAMES } from '@src/models/level';

export type LevelGetRequest = Request<
	never,
	{
		infoMessage?: string;
	},
	never,
	{
		level?: LEVEL_NAMES;
	}
>;
