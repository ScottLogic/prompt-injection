import { Request } from 'express';

import { CHAT_INFO_MESSAGE_TYPE } from '@src/models/chatMessage';
import { LEVEL_NAMES } from '@src/models/level';

export type OpenAiAddInfoToChatHistoryRequest = Request<
	never,
	never,
	{
		chatMessageType?: CHAT_INFO_MESSAGE_TYPE;
		infoMessage?: string;
		level?: LEVEL_NAMES;
	},
	never,
	never
>;
