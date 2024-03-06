import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import { LEVEL_NAMES, LevelSystemRole } from '@src/models/level';

import HandbookSystemRole from './HandbookSystemRole';

describe('HandbookSystemRole component tests', () => {
	const level1SystemRole = 'System Role for level 1';
	const level2SystemRole = 'System Role for level 2';
	const level3SystemRole = 'System Role for level 3';
	const errorMessage =
		'Unable to fetch system role information. Try again in a few minutes.';

	const systemRoles: LevelSystemRole[] = [
		{ level: LEVEL_NAMES.LEVEL_1, systemRole: level1SystemRole },
		{ level: LEVEL_NAMES.LEVEL_2, systemRole: level2SystemRole },
		{ level: LEVEL_NAMES.LEVEL_3, systemRole: level3SystemRole },
	];

	test('renders no system roles and instead renders locked boxes when no levels complete', () => {
		const numLevelsCompleted = 0;

		render(
			<HandbookSystemRole
				numCompletedLevels={numLevelsCompleted}
				systemRoles={systemRoles}
			/>
		);

		expect(screen.getByText('System Roles')).toBeInTheDocument();

		// make sure no system roles are displayed on the page
		expect(screen.queryByText(level1SystemRole)).not.toBeInTheDocument();
		expect(screen.queryByText(level2SystemRole)).not.toBeInTheDocument();
		expect(screen.queryByText(level3SystemRole)).not.toBeInTheDocument();

		// check aria roles for term headers
		const systemRoleScreen = screen
			.getAllByRole('term')
			.map((element) => element.textContent);
		expect(systemRoleScreen).toHaveLength(systemRoles.length);

		// checks for an instance of the system role locked text for all roles
		expect(
			screen.queryAllByText(/to unlock the system role description/)
		).toHaveLength(3);
	});

	test('renders level 1 system role only and keeps level 2 and 3 system roles locked boxes when 1 levels complete', () => {
		const numLevelsCompleted = 1;

		render(
			<HandbookSystemRole
				numCompletedLevels={numLevelsCompleted}
				systemRoles={systemRoles}
			/>
		);

		expect(screen.getByText('System Roles')).toBeInTheDocument();

		// check level 1 is shown but level 2 and 3 are not
		expect(screen.queryByText(level1SystemRole)).toBeInTheDocument();
		expect(screen.queryByText(level2SystemRole)).not.toBeInTheDocument();
		expect(screen.queryByText(level3SystemRole)).not.toBeInTheDocument();

		// check aria roles
		const systemRoleScreen = screen
			.getAllByRole('term')
			.map((element) => element.textContent);
		expect(systemRoleScreen).toHaveLength(systemRoles.length);

		// checks for an instance of the system role locked text for 2 roles
		expect(
			screen.queryAllByText(/to unlock the system role description/)
		).toHaveLength(2);
	});

	test('renders level 1 & 2 system roles and keeps level 3 system roles locked boxe when 2 levels complete', () => {
		const numLevelsCompleted = 2;

		render(
			<HandbookSystemRole
				numCompletedLevels={numLevelsCompleted}
				systemRoles={systemRoles}
			/>
		);

		expect(screen.getByText('System Roles')).toBeInTheDocument();

		// check level 1 and 3 are shown and 3 is not
		expect(screen.queryByText(level1SystemRole)).toBeInTheDocument();
		expect(screen.queryByText(level2SystemRole)).toBeInTheDocument();
		expect(screen.queryByText(level3SystemRole)).not.toBeInTheDocument();

		// checks for an instance of the system role locked text for 1 roles
		expect(
			screen.queryAllByText(/to unlock the system role description/)
		).toHaveLength(1);
	});

	test('renders all system roles when 3 levels complete', () => {
		const numLevelsCompleted = 3;

		render(
			<HandbookSystemRole
				numCompletedLevels={numLevelsCompleted}
				systemRoles={systemRoles}
			/>
		);

		expect(screen.getByText('System Roles')).toBeInTheDocument();

		// check all levels system roles are shown
		expect(screen.queryByText(level1SystemRole)).toBeInTheDocument();
		expect(screen.queryByText(level2SystemRole)).toBeInTheDocument();
		expect(screen.queryByText(level3SystemRole)).toBeInTheDocument();

		// check aria roles
		const systemRoleScreen = screen
			.getAllByRole('term')
			.map((element) => element.textContent);
		expect(systemRoleScreen).toHaveLength(systemRoles.length);

		// checks for that none of the roles are locked
		expect(
			screen.queryAllByText(/to unlock the system role description/)
		).toHaveLength(0);
	});

	test('renders an error message when no system roles are passed to it', () => {
		const numLevelsCompleted = 0;

		render(
			<HandbookSystemRole
				numCompletedLevels={numLevelsCompleted}
				systemRoles={[]}
			/>
		);

		expect(screen.getByText('System Roles')).toBeInTheDocument();

		// make sure no system roles are displayed on the page
		expect(screen.queryByText(level1SystemRole)).not.toBeInTheDocument();
		expect(screen.queryByText(level2SystemRole)).not.toBeInTheDocument();
		expect(screen.queryByText(level3SystemRole)).not.toBeInTheDocument();

		// check that the error message is displayed
		expect(screen.queryByText(errorMessage)).toBeInTheDocument();
	});

	test('renders no error message when system roles are passed to it', () => {
		const numLevelsCompleted = 0;

		render(
			<HandbookSystemRole
				numCompletedLevels={numLevelsCompleted}
				systemRoles={systemRoles}
			/>
		);

		// check that the error message is not being displayed
		expect(screen.queryByText(errorMessage)).not.toBeInTheDocument();
	});
});
