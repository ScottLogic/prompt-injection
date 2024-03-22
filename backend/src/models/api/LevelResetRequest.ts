import { Request } from 'express';

import { ChatMessage } from '@src/models/chatMessage';
import { LEVEL_NAMES } from '@src/models/level';

export type LevelResetRequest = Request<
	never,
	{
		resultingChatInfoMessage?: ChatMessage;
	},
	never,
	{
		level?: LEVEL_NAMES;
	}
>;
