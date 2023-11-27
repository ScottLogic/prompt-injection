import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';

import { LEVELS } from '@src/Levels';

import LevelSelectionBox, { LevelSelectionBoxProps } from './LevelSelectionBox';

const defaultProps: LevelSelectionBoxProps = {
	currentLevel: LEVELS[0].id,
	numCompletedLevels: 0,
	setCurrentLevel: () => {},
};

function renderComponent(props: LevelSelectionBoxProps = defaultProps) {
	const user = userEvent.setup();
	render(<LevelSelectionBox {...props} />);
	return { user };
}

function isSandbox(name: string) {
	return /Sandbox/i.test(name);
}

const storyLevels = LEVELS.filter(({ name }) => !isSandbox(name));

describe('LevelSelectionBox component tests', () => {
	test('renders one button per level, when not in sandbox', () => {
		renderComponent();

		const levelButtons = screen.getAllByRole('button');
		expect(levelButtons).toHaveLength(storyLevels.length);
		storyLevels.forEach(({ name }) => {
			expect(screen.getByRole('button', { name })).toBeInTheDocument();
		});
	});

	test('renders current level selected', () => {
		const currentLevel = LEVELS[1];

		renderComponent({ ...defaultProps, currentLevel: currentLevel.id });

		const selectedButtons = screen
			.getAllByRole('button')
			.filter((button) => button.classList.contains('selected'));
		expect(selectedButtons).toHaveLength(1);
		expect(selectedButtons[0]).toHaveAccessibleName(currentLevel.name);
	});

	test('renders buttons ahead of current level disabled', () => {
		const numCompletedLevels = 1;
		const currentLevel = LEVELS[numCompletedLevels];

		renderComponent({ ...defaultProps, numCompletedLevels });

		storyLevels.forEach(({ id, name }) => {
			const button = screen.getByRole('button', { name });
			if (id <= currentLevel.id) {
				expect(button).toBeEnabled();
			} else {
				expect(button).toBeDisabled();
			}
		});
	});

	test.each(storyLevels)(
		`fires callback on click, unless current level [$name] clicked`,
		async (level) => {
			const currentLevel = LEVELS[0];
			const setCurrentLevel = vi.fn();
			const { user } = renderComponent({
				currentLevel: LEVELS[0].id,
				numCompletedLevels: 3,
				setCurrentLevel,
			});

			await user.click(screen.getByRole('button', { name: level.name }));

			if (level === currentLevel) {
				expect(setCurrentLevel).not.toHaveBeenCalled();
			} else {
				expect(setCurrentLevel).toHaveBeenCalledOnce();
				expect(setCurrentLevel).toHaveBeenCalledWith(level.id);
			}
		}
	);
});
