import { Request } from 'express';

import { DEFENCE_TYPES } from '@src/models/defence';
import { LEVEL_NAMES } from '@src/models/level';

type DefenceActivateRequest = Request<
	object,
	object,
	{
		defenceId?: DEFENCE_TYPES;
		level?: LEVEL_NAMES;
	},
	object
>;

export type { DefenceActivateRequest };
