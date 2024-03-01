import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, test } from 'vitest';

import { LEVEL_NAMES } from '@src/models/level';

import useLocalStorage from './useLocalStorage';

const newUserKey = 'isNewUser';
const currentLevelKey = 'currentLevel';
const completedLevelsKey = 'numCompletedLevels';

describe('useLocalStorage hook', () => {
	afterEach(() => {
		localStorage.clear();
	});

	test.each([true, false])(
		`Reads ${newUserKey} from localStorage on init`,
		(isNewUser) => {
			localStorage.setItem(newUserKey, `${isNewUser}`);

			const { result } = renderHook(useLocalStorage);
			expect(result.current.isNewUser).toBe(isNewUser);
		}
	);

	test(`Default to ${newUserKey}=true when unset`, () => {
		const { result } = renderHook(useLocalStorage);
		expect(result.current.isNewUser).toBe(true);
	});

	test(`Reads ${currentLevelKey} from localStorage on init, if not new user`, () => {
		localStorage.setItem(newUserKey, 'false');
		localStorage.setItem(currentLevelKey, LEVEL_NAMES.LEVEL_3.toString());

		const { result } = renderHook(useLocalStorage);
		expect(result.current.currentLevel).toBe(LEVEL_NAMES.LEVEL_3);
	});

	test(`Ignores ${currentLevelKey} in localStorage on init, if new user`, () => {
		localStorage.setItem(newUserKey, 'true');
		localStorage.setItem(currentLevelKey, LEVEL_NAMES.LEVEL_3.toString());

		const { result } = renderHook(useLocalStorage);
		expect(result.current.currentLevel).toBe(LEVEL_NAMES.LEVEL_1);
	});

	test(`Reads ${completedLevelsKey} from localStorage on init, if not new user`, () => {
		localStorage.setItem(newUserKey, 'false');
		localStorage.setItem(completedLevelsKey, '2');

		const { result } = renderHook(useLocalStorage);
		expect(result.current.numCompletedLevels).toBe(2);
	});

	test(`Ignores ${completedLevelsKey} in localStorage on init, if new user`, () => {
		localStorage.setItem(newUserKey, 'true');
		localStorage.setItem(completedLevelsKey, '2');

		const { result } = renderHook(useLocalStorage);
		expect(result.current.currentLevel).toBe(0);
	});

	test(`Persists ${newUserKey} in storage when set`, () => {
		const { result } = renderHook(useLocalStorage);
		expect(result.current.isNewUser).toBe(true);

		act(() => {
			result.current.setIsNewUser(false);
		});

		expect(result.current.isNewUser).toBe(false);
		expect(localStorage.getItem(newUserKey)).toEqual('false');
	});

	test(`Persists ${currentLevelKey} in storage when set`, () => {
		const { result } = renderHook(useLocalStorage);
		expect(result.current.currentLevel).toBe(LEVEL_NAMES.LEVEL_1);

		act(() => {
			result.current.setCurrentLevel(LEVEL_NAMES.LEVEL_3);
		});

		expect(result.current.currentLevel).toBe(LEVEL_NAMES.LEVEL_3);
		expect(localStorage.getItem(currentLevelKey)).toEqual(
			`${LEVEL_NAMES.LEVEL_3}`
		);
	});

	test(`Persists ${completedLevelsKey} in storage when set`, () => {
		const { result } = renderHook(useLocalStorage);
		expect(result.current.numCompletedLevels).toBe(0);

		act(() => {
			result.current.setCompletedLevels(2);
		});

		expect(result.current.numCompletedLevels).toBe(2);
		expect(localStorage.getItem(completedLevelsKey)).toEqual('2');
	});

	test(`${completedLevelsKey} is unchanged when setting it lower than current`, () => {
		localStorage.setItem(newUserKey, 'false');
		localStorage.setItem(completedLevelsKey, '3');

		const { result } = renderHook(useLocalStorage);
		expect(result.current.numCompletedLevels).toBe(3);

		act(() => {
			result.current.setCompletedLevels(2);
		});

		expect(result.current.numCompletedLevels).toBe(3);
		expect(localStorage.getItem(completedLevelsKey)).toEqual('3');
	});
});
