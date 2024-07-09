import { Request } from 'express';

import { ChatMessage } from '@src/models/chatMessage';

export type LevelResetResponseBody = {
	chatInfoMessage?: ChatMessage;
};

export type LevelResetRequest = Request<
	{ level: string },
	LevelResetResponseBody,
	never,
	never
>;
