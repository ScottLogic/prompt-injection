import { Request } from 'express';

import { ChatModel } from '@src/models/chat';
import { ChatMessage } from '@src/models/chatMessage';
import { Defence } from '@src/models/defence';
import { DocumentMeta } from '@src/models/document';
import { EmailInfo } from '@src/models/email';
import { LEVEL_NAMES } from '@src/models/level';

export type LevelGetResponseBody = {
	emails: EmailInfo[];
	chatHistory: ChatMessage[];
	defences?: Defence[];
	chatModel?: ChatModel;
	availableDocs?: DocumentMeta[];
};

export type LevelGetRequest = Request<
	never,
	LevelGetResponseBody,
	never,
	{
		level?: LEVEL_NAMES;
	}
>;
