import { Request } from 'express';

import { ChatModel } from '@src/models/chat';
import { ChatMessage } from '@src/models/chatMessage';
import { Defence } from '@src/models/defence';
import { DocumentMeta } from '@src/models/document';
import { EmailInfo } from '@src/models/email';
import { LEVEL_NAMES } from '@src/models/level';

export type StartGetResponseBody = {
	emails: EmailInfo[];
	chatHistory: ChatMessage[];
	defences?: Defence[];
	availableModels: string[];
	systemRoles: {
		level: LEVEL_NAMES;
		systemRole: string;
	}[];
	chatModel?: ChatModel;
	availableDocs?: DocumentMeta[];
};

export type StartGetRequest = Request<
	never,
	StartGetResponseBody,
	never,
	{
		level?: LEVEL_NAMES;
	}
>;
