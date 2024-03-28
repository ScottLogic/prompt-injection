import { Request } from 'express';

import { CHAT_MODELS, ChatModelConfigurations } from '@src/models/chat';

export type OpenAiSetModelRequest = Request<
	never,
	never,
	{
		model?: CHAT_MODELS;
		configuration?: ChatModelConfigurations;
	},
	never
>;
