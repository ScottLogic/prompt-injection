import { Request } from 'express';

import { ChatMessage } from '@src/models/chatMessage';

export type OpenAiGetHistoryRequest = Request<
	never,
	ChatMessage[] | string,
	never,
	{
		level?: string;
	}
>;
