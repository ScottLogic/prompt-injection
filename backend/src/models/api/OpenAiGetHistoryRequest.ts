import { Request } from 'express';

import { ChatMessage } from '@src/models/chat';

export type OpenAiGetHistoryRequest = Request<
	never,
	ChatMessage[] | string,
	never,
	{
		level?: string;
	}
>;
