import { Request } from 'express';

import { CHAT_MODELS, ChatModelConfiguration } from '@src/models/chat';
import { LEVEL_NAMES } from '@src/models/level';

export type OpenAiSetModelRequest = Request<
	never,
	never,
	{
		model?: CHAT_MODELS;
		configuration?: ChatModelConfiguration;
	},
	{
		level?: LEVEL_NAMES;
	}
>;
