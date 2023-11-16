import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';

import ShortMissionInfoButton from './ShortMissionInfoButton';

import { LEVELS } from '@src/Levels';
import { LEVEL_NAMES } from '@src/models/level';

describe('ShortMissionInfoButton component tests', () => {
	test('renders the button with the current levels mission info', () => {
		const currentLevel = LEVEL_NAMES.LEVEL_1;
		render(
			<ShortMissionInfoButton
				currentLevel={currentLevel}
				openOverlay={() => {}}
			/>
		);

		const button = screen.getByRole('button');
		const expectedContent = LEVELS[currentLevel].missionInfoShort ?? '';
		expect(button).toHaveTextContent(expectedContent);
	});

	test('fires the openOverlay callback on button click', () => {
		const currentLevel = LEVEL_NAMES.LEVEL_1;

		const openOverlayMock = vi.fn();
		render(
			<ShortMissionInfoButton
				currentLevel={currentLevel}
				openOverlay={openOverlayMock}
			/>
		);

		const button = screen.getByRole('button');
		fireEvent.click(button);

		expect(openOverlayMock).toHaveBeenCalled();
	});
});
