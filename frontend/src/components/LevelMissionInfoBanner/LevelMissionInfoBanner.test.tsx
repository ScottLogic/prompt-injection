import {
	render,
	screen,
	fireEvent,
	getDefaultNormalizer,
} from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';

import { LEVELS } from '@src/Levels';
import { LEVEL_NAMES } from '@src/models/level';

import LevelMissionInfoBanner from './LevelMissionInfoBanner';

describe('LevelMissionInfoBanner component tests', () => {
	test('renders the button with the current levels mission info', () => {
		const currentLevel = LEVEL_NAMES.LEVEL_1;
		render(
			<LevelMissionInfoBanner
				currentLevel={currentLevel}
				openOverlay={() => {}}
				openLevelsCompleteOverlay={() => {}}
				numCompletedLevels={currentLevel}
			/>
		);

		const expectedContent = LEVELS[currentLevel].missionInfoShort;

		if (!expectedContent)
			throw new Error(`No missionInfoShort found for level ${currentLevel}`);

		const expectedText = getDefaultNormalizer()(
			expectedContent.slice(0, expectedContent.indexOf(' <u>'))
		);
		const banner = screen.getByText(expectedText);
		expect(banner).toContainHTML(expectedContent);
	});

	test('fires the openOverlay callback on button click', () => {
		const currentLevel = LEVEL_NAMES.LEVEL_1;

		const openOverlayMock = vi.fn();
		render(
			<LevelMissionInfoBanner
				currentLevel={currentLevel}
				openOverlay={openOverlayMock}
				openLevelsCompleteOverlay={() => {}}
				numCompletedLevels={currentLevel}
			/>
		);

		const button = screen.getByRole('button');
		fireEvent.click(button);

		expect(openOverlayMock).toHaveBeenCalled();
	});

	test('fires the openLevelsCompleteOverlay callback on button click', () => {
		const currentLevel = LEVEL_NAMES.LEVEL_3;

		const openOverlayMock = vi.fn();
		render(
			<LevelMissionInfoBanner
				currentLevel={currentLevel}
				openOverlay={() => {}}
				openLevelsCompleteOverlay={openOverlayMock}
				numCompletedLevels={4}
			/>
		);

		const button = screen.getByText('Congratulations!');
		fireEvent.click(button);

		expect(openOverlayMock).toHaveBeenCalled();
	});
});
