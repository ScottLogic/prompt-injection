import { Request } from 'express';

import { ChatMessage } from '@src/models/chatMessage';

export type OpenAiConfigureModelRequest = Request<
	never,
	null | { chatInfoMessage: ChatMessage },
	{
		configId?: string;
		value?: number;
	},
	never
>;
