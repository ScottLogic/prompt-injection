import { Request } from 'express';

import { CHAT_MODEL_ID, ChatModelConfigurations } from '@src/models/chat';

export type OpenAiSetModelRequest = Request<
	never,
	never,
	{
		model?: CHAT_MODEL_ID;
		configuration?: ChatModelConfigurations;
	},
	never
>;
