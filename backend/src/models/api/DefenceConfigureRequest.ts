import { Request } from 'express';

import { DEFENCE_TYPES, DefenceConfig } from '@src/models/defence';
import { LEVEL_NAMES } from '@src/models/level';

export type DefenceConfigureRequest = Request<
	never,
	null | string,
	{
		config?: DefenceConfig[];
		defenceId?: DEFENCE_TYPES;
		level?: LEVEL_NAMES;
	},
	never
>;
