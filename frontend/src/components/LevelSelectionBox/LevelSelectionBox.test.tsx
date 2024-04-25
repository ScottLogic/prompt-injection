import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';

import { Levels } from '@src/levels';
import { LEVEL_NAMES } from '@src/models/level';

import LevelSelectionBox, { LevelSelectionBoxProps } from './LevelSelectionBox';

const defaultProps: LevelSelectionBoxProps = {
	currentLevel: Levels[0].id,
	numCompletedLevels: 0,
	setCurrentLevel: () => {},
};

function renderComponent(props: LevelSelectionBoxProps = defaultProps) {
	const user = userEvent.setup();
	render(<LevelSelectionBox {...props} />);
	return { user };
}

const levels = Levels.map(({ id, name }) => ({
	id,
	name: id === LEVEL_NAMES.SANDBOX ? name : `Level ${id + 1}`,
}));

describe('LevelSelectionBox component tests', () => {
	test('renders one button per level', () => {
		renderComponent();

		const levelButtons = screen.getAllByRole('button');
		expect(levelButtons).toHaveLength(levels.length);
		levels.forEach(({ name }) => {
			expect(screen.getByRole('button', { name })).toBeInTheDocument();
		});
	});

	test('renders current level selected', () => {
		const currentLevel = levels[1];

		renderComponent({ ...defaultProps, currentLevel: currentLevel.id });

		const selectedButtons = screen
			.getAllByRole('button')
			.filter((button) => button.classList.contains('selected'));

		expect(selectedButtons).toHaveLength(1);
		expect(selectedButtons[0]).toHaveAccessibleName(currentLevel.name);
	});

	test('renders buttons disabled ahead of highest level completed, except for sandbox', () => {
		const numCompletedLevels = 1;
		const currentLevel = Levels[numCompletedLevels];
		const setCurrentLevel = vi.fn();

		renderComponent({
			...defaultProps,
			currentLevel: currentLevel.id,
			numCompletedLevels,
			setCurrentLevel,
		});

		for (const { id, name } of levels) {
			const button = screen.getByRole('button', { name });
			const expectDisabled = id > currentLevel.id && id !== LEVEL_NAMES.SANDBOX;
			expect(button).toHaveAttribute('aria-disabled', `${expectDisabled}`);
			expect(button).toBeEnabled();
		}
	});

	test('clicking aria-disabled button does not trigger level change', async () => {
		const numCompletedLevels = 0;
		const currentLevel = Levels[numCompletedLevels];
		const setCurrentLevel = vi.fn();

		const { user } = renderComponent({
			...defaultProps,
			currentLevel: currentLevel.id,
			numCompletedLevels,
			setCurrentLevel,
		});

		const disabledLevels = levels.filter(
			({ id }) => id > currentLevel.id && id !== LEVEL_NAMES.SANDBOX
		);
		for (const { name } of disabledLevels) {
			const button = screen.getByRole('button', { name });
			expect(button).toHaveAttribute('aria-disabled', 'true');
			await user.click(button);
			expect(setCurrentLevel).not.toHaveBeenCalled();
		}
	});

	test.each(levels)(
		'clicking current level button does not trigger level change',
		async (level) => {
			const setCurrentLevel = vi.fn();

			const { user } = renderComponent({
				...defaultProps,
				currentLevel: level.id,
				numCompletedLevels: level.id as number,
				setCurrentLevel,
			});

			const button = screen.getByRole('button', { name: level.name });
			await user.click(button);
			expect(setCurrentLevel).not.toHaveBeenCalled();
		}
	);
});
