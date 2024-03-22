import { ChatMessageDTO, ChatModel } from './chat';
import { DefenceDTO } from './defence';
import { EmailInfo } from './email';
import { LevelSystemRole } from './level';

type StartReponse = {
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

type ConfigureGptModelResponse = {
	resultingChatInfoMessage: ChatMessageDTO;
};

export type { StartReponse, LoadLevelResponse, ConfigureGptModelResponse };
