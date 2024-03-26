import { Request } from 'express';

import { ChatMessage } from '@src/models/chatMessage';
import { LEVEL_NAMES } from '@src/models/level';

export type LevelResetRequest = Request<
	{ level: string }, // can we use a middleware to convert this to LEVEL_NAMES?
	{
		chatInfoMessage?: ChatMessage;
	},
	never,
	{
		level?: LEVEL_NAMES;
	}
>;
