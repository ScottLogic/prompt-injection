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
};

type LoadLevelResponse = {
	emails: EmailInfo[];
	chatHistory: ChatMessageDTO[];
	defences?: DefenceDTO[];
	chatModel?: ChatModel;
};

export type { StartResponse, LoadLevelResponse };
