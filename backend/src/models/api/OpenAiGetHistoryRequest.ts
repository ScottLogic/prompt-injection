import { Request } from 'express';

import { ChatHistoryMessage } from '@src/models/chat';

export type OpenAiGetHistoryRequest = Request<
	never,
	ChatHistoryMessage[] | string,
	never,
	{
		level?: string;
	}
>;
