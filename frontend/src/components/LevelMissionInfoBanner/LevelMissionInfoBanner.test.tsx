import { render, screen, fireEvent } from '@testing-library/react';
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
			/>
		);

		const button = screen.getByRole('button');
		const expectedContent = LEVELS[currentLevel].missionInfoShort ?? '';
		expect(button).toContainHTML(expectedContent);
	});

	test('fires the openOverlay callback on button click', () => {
		const currentLevel = LEVEL_NAMES.LEVEL_1;

		const openOverlayMock = vi.fn();
		render(
			<LevelMissionInfoBanner
				currentLevel={currentLevel}
				openOverlay={openOverlayMock}
			/>
		);

		const button = screen.getByRole('button');
		fireEvent.click(button);

		expect(openOverlayMock).toHaveBeenCalled();
	});
});
