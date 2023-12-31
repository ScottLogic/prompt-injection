import { Request } from 'express';

import { LEVEL_NAMES } from '@src/models/level';

export type DefenceResetRequest = Request<
	never,
	never,
	{
		level?: LEVEL_NAMES;
	},
	never
>;
