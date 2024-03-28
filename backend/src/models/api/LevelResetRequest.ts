import { Request } from 'express';

import { ChatMessage } from '@src/models/chatMessage';

export type LevelResetRequest = Request<
	{ level: string },
	{
		chatInfoMessage?: ChatMessage;
	},
	never,
	never
>;
