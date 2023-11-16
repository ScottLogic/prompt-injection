import { Request } from 'express';

import { CHAT_MODELS, ChatModelConfiguration } from '@src/models/chat';

type OpenAiSetModelRequest = Request<
	object,
	object,
	{
		model?: CHAT_MODELS;
		configuration?: ChatModelConfiguration;
	},
	object
>;

export type { OpenAiSetModelRequest };
