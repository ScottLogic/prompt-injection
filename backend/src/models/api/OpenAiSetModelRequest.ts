import { Request } from 'express';

import { CHAT_MODEL_ID, ChatModelConfigurations } from '@src/models/chat';
import { ChatMessage } from '@src/models/chatMessage';

export type OpenAiSetModelRequest = Request<
	never,
	{
		chatInfoMessage: ChatMessage;
	},
	{
		model?: CHAT_MODEL_ID;
		configuration?: ChatModelConfigurations;
	},
	never
>;
