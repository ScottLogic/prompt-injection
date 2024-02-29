import { useCallback, useState } from 'react';

import { LEVEL_NAMES } from '@src/models/level';

export default function useLocalStorage() {
	const [isNewUser, setNewUser] = useState(loadIsNewUser);

	const setIsNewUser = useCallback((isNew: boolean) => {
		setNewUser(isNew);
		localStorage.setItem('isNewUser', isNew.toString());
	}, []);

	const [currentLevel, setLevel] = useState<LEVEL_NAMES>(
		loadCurrentLevel(isNewUser)
	);

	const setCurrentLevel = useCallback((level: LEVEL_NAMES) => {
		setLevel(level);
		localStorage.setItem('currentLevel', level.toString());
	}, []);

	const [numCompletedLevels, setNumCompletedLevels] = useState(
		loadNumCompletedLevels(isNewUser)
	);

	const setCompletedLevels = useCallback((levels: number) => {
		setNumCompletedLevels((prev) => {
			const completed = Math.max(prev, levels);
			localStorage.setItem('numCompletedLevels', `${completed}`);
			return completed;
		});
	}, []);

	const resetCompletedLevels = useCallback(() => {
		setNumCompletedLevels(0);
		localStorage.setItem('numCompletedLevels', '0');
	}, []);

	return {
		isNewUser,
		setIsNewUser,
		currentLevel,
		setCurrentLevel,
		numCompletedLevels,
		setCompletedLevels,
		resetCompletedLevels,
	};
}

function loadIsNewUser() {
	// eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
	return (localStorage.getItem('isNewUser') || 'true') === 'true';
}

function loadCurrentLevel(isNewUser: boolean) {
	const levelInStorage = localStorage.getItem('currentLevel');
	const level =
		levelInStorage && !isNewUser
			? parseInt(levelInStorage)
			: LEVEL_NAMES.LEVEL_1;

	if (
		Number.isNaN(level) ||
		level < LEVEL_NAMES.LEVEL_1 ||
		level > LEVEL_NAMES.SANDBOX
	) {
		console.error(
			`Invalid level ${level} in local storage, defaulting to level 1`
		);
		return LEVEL_NAMES.LEVEL_1;
	}

	return level as LEVEL_NAMES;
}

function loadNumCompletedLevels(isNewUser: boolean) {
	const numCompletedLevelsStr = localStorage.getItem('numCompletedLevels');
	if (numCompletedLevelsStr && !isNewUser) {
		// keep user's progress from where they last left off
		return parseInt(numCompletedLevelsStr);
	} else {
		return 0;
	}
}
