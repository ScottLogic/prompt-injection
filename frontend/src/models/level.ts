import { ChatMessage } from './chat';
import { Defence } from './defence';
import { EmailInfo } from './email';

enum LEVEL_NAMES {
	LEVEL_1 = 0,
	LEVEL_2,
	LEVEL_3,
	SANDBOX,
}

interface Level {
	id: LEVEL_NAMES;
	name: string;
	missionInfoShort?: string;
	missionInfoDialogue: DialogueLine[];
}

interface DialogueLine {
	speaker: string;
	text: string;
}

interface ModeSelectButton {
	displayName: string;
	targetLevel: LEVEL_NAMES;
}

interface LevelSystemRole {
	level: LEVEL_NAMES;
	systemRole: string;
}

type startReponse = {
	emails: EmailInfo[];
	history: ChatMessage[];
	defences: Defence[];
	models: string[];
	systemRoles: LevelSystemRole[];
};

export { LEVEL_NAMES };
export type {
	DialogueLine,
	Level,
	ModeSelectButton,
	LevelSystemRole,
	startReponse,
};
