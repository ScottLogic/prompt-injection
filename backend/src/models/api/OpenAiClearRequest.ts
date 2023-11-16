import { Request } from 'express';

import { LEVEL_NAMES } from '@src/models/level';

type OpenAiClearRequest = Request<
	object,
	object,
	{
		level?: LEVEL_NAMES;
	},
	object
>;

export type { OpenAiClearRequest };
