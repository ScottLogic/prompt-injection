import { Request } from 'express';

import { ChatModel } from '@src/models/chat';
import { LEVEL_NAMES } from '@src/models/level';

export type OpenAIGetModelRequest = Request<
	never,
	ChatModel | string,
	never,
	{
		level?: LEVEL_NAMES;
	}
>;
