import { defaultDefences } from '@src/defaultDefences';

import { ChatMessage } from './chatMessage';
import { Defence } from './defence';
import { EmailInfo } from './email';

enum LEVEL_NAMES {
	LEVEL_1,
	LEVEL_2,
	LEVEL_3,
	SANDBOX,
}

interface LevelState {
	level: LEVEL_NAMES;
	chatHistory: ChatMessage[];
	defences: Defence[];
	sentEmails: EmailInfo[];
}

const levelsInitialState = Object.values(LEVEL_NAMES)
	.filter((value) => Number.isNaN(Number(value)))
	.map((value) => ({
		level: value as LEVEL_NAMES,
		chatHistory: [],
		defences: defaultDefences,
		sentEmails: [],
	}));

export { LEVEL_NAMES, levelsInitialState };
export type { LevelState };
