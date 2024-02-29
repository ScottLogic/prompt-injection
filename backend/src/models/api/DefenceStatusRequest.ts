import { Request } from 'express';

import { Defence } from '@src/models/defence';
import { LEVEL_NAMES } from '@src/models/level';

export type DefenceStatusRequest = Request<
	never,
	Defence[] | string,
	never,
	{
		level?: LEVEL_NAMES;
	}
>;
