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

function isValidLevel(levelValue: unknown) {
	return Object.values(LEVEL_NAMES).includes(levelValue as LEVEL_NAMES);
}

interface LevelState {
	level: LEVEL_NAMES;
	chatHistory: ChatMessage[];
	defences?: Defence[];
	sentEmails: EmailInfo[];
}

function getInitialLevelStates() {
	const levelsWithDefences: number[] = [
		LEVEL_NAMES.LEVEL_3,
		LEVEL_NAMES.SANDBOX,
	];

	return Object.values(LEVEL_NAMES).map(
		(level) =>
			({
				level,
				chatHistory: [],
				defences: levelsWithDefences.includes(level)
					? defaultDefences
					: undefined,
				sentEmails: [],
			} as LevelState)
	);
}

export { getInitialLevelStates, LEVEL_NAMES, isValidLevel };
export type { LevelState };
