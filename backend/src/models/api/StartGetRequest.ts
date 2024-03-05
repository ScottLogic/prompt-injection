import { Request } from 'express';

import { ChatMessage } from '@src/models/chatMessage';
import { Defence } from '@src/models/defence';
import { EmailInfo } from '@src/models/email';
import { LEVEL_NAMES } from '@src/models/level';

export type StartResponse = {
	emails: EmailInfo[];
	chatHistory: ChatMessage[];
	defences: Defence[];
	availableModels: string[];
	systemRoles: {
		level: LEVEL_NAMES;
		systemRole: string;
	}[];
};

export type StartGetRequest = Request<
	never,
	StartResponse,
	never,
	{
		level?: LEVEL_NAMES;
	}
>;
