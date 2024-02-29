const LEVEL_NAMES = {
	LEVEL_1: 0,
	LEVEL_2: 1,
	LEVEL_3: 2,
	SANDBOX: 3,
} as const;

type LEVEL_NAMES = (typeof LEVEL_NAMES)[keyof typeof LEVEL_NAMES];

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

export { LEVEL_NAMES };
export type { DialogueLine, Level, ModeSelectButton, LevelSystemRole };
