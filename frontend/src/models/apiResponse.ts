import { DocumentMeta } from '@src/models/document';

import { ChatMessageDTO, ChatModel } from './chat';
import { DefenceDTO } from './defence';
import { EmailInfo } from './email';
import { LevelSystemRole } from './level';

type StartResponse = {
	emails: EmailInfo[];
	chatHistory: ChatMessageDTO[];
	defences?: DefenceDTO[];
	availableModels: string[];
	systemRoles: LevelSystemRole[];
	chatModel?: ChatModel;
	availableDocs?: DocumentMeta[];
};

type LoadLevelResponse = {
	emails: EmailInfo[];
	chatHistory: ChatMessageDTO[];
	defences?: DefenceDTO[];
	chatModel?: ChatModel;
	availableDocs?: DocumentMeta[];
};

type ChatInfoMessageResponse = {
	chatInfoMessage: ChatMessageDTO;
};

export type { StartResponse, LoadLevelResponse, ChatInfoMessageResponse };
