import { defaultDefences } from '@src/defaultDefences';

import { ChatMessage } from './chatMessage';
import { Defence } from './defence';
import { EmailInfo } from './email';

const LEVEL_NAMES = {
	LEVEL_1: 0,
	LEVEL_2: 1,
	LEVEL_3: 2,
	SANDBOX: 3,
} as const;

type LEVEL_NAMES = (typeof LEVEL_NAMES)[keyof typeof LEVEL_NAMES];

interface LevelState {
	level: LEVEL_NAMES;
	chatHistory: ChatMessage[];
	defences: Defence[];
	sentEmails: EmailInfo[];
}

function getInitialLevelStates() {
	return Object.values(LEVEL_NAMES).map(
		(level) =>
			({
				level,
				chatHistory: [],
				defences: defaultDefences,
				sentEmails: [],
			} as LevelState)
	);
}

export { getInitialLevelStates, LEVEL_NAMES };
export type { LevelState };
