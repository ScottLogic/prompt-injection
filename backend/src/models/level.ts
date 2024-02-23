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
	defences?: Defence[];
	sentEmails: EmailInfo[];
}

function getInitialLevelStates() {
	return Object.values(LEVEL_NAMES)
		.filter((value) => Number.isNaN(Number(value)))
		.map((value) => {
			return {
				level: value as LEVEL_NAMES,
				chatHistory: [],
				defences:
					value === 'LEVEL_1' || value === 'LEVEL_2'
						? undefined
						: defaultDefences,
				sentEmails: [],
			} as LevelState;
		});
}

export { LEVEL_NAMES, getInitialLevelStates };
export type { LevelState };
