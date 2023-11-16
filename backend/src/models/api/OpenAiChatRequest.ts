import { Request } from 'express';

import { LEVEL_NAMES } from '@src/models/level';

type OpenAiChatRequest = Request<
	object,
	object,
	{
		currentLevel?: LEVEL_NAMES;
		message?: string;
	},
	object
>;

export type { OpenAiChatRequest };
