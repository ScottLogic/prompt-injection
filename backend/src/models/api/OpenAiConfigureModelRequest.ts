import { Request } from 'express';

import { LEVEL_NAMES } from '@src/models/level';

export type OpenAiConfigureModelRequest = Request<
	never,
	never,
	{
		configId?: string;
		value?: number;
	},
	{
		level?: LEVEL_NAMES;
	}
>;
