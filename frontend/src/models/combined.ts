import { ChatMessageDTO } from './chat';
import { Defence } from './defence';
import { EmailInfo } from './email';
import { LevelSystemRole } from './level';

type StartReponse = {
	emails: EmailInfo[];
	history: ChatMessageDTO[];
	defences: Defence[];
	availableModels: string[];
	systemRoles: LevelSystemRole[];
};

export type { StartReponse };
