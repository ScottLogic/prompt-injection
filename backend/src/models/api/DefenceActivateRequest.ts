import { Request } from 'express';

import { DEFENCE_TYPES } from '@src/models/defence';
import { LEVEL_NAMES } from '@src/models/level';

export type DefenceActivateRequest = Request<
	never,
	never,
	{
		defenceId?: DEFENCE_TYPES;
		level?: LEVEL_NAMES;
	},
	never
>;
