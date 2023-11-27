import { Request } from 'express';

import { CHAT_MESSAGE_TYPE } from '@src/models/chat';
import { LEVEL_NAMES } from '@src/models/level';

export type OpenAiAddHistoryRequest = Request<
	never,
	never,
	{
		chatMessageType?: CHAT_MESSAGE_TYPE;
		message?: string;
		level?: LEVEL_NAMES;
	},
	never,
	never
>;
