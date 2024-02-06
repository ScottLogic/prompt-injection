import { Request } from 'express';

import { CHAT_MESSAGE_TYPE_AS_INFO } from '@src/models/chatMessage';
import { LEVEL_NAMES } from '@src/models/level';

export type OpenAiAddHistoryAsInfoRequest = Request<
	never,
	never,
	{
		chatMessageType?: CHAT_MESSAGE_TYPE_AS_INFO;
		infoMessage?: string;
		level?: LEVEL_NAMES;
	},
	never,
	never
>;
