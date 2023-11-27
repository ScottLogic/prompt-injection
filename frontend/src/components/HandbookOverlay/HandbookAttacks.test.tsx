import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import HandbookAttacks from './HandbookAttacks';
import { ATTACKS_LEVEL_2, ATTACKS_LEVEL_3, ATTACKS_ALL } from '@src/Attacks';
import { LEVEL_NAMES } from '@src/models/level';

describe('HandbookAttacks component tests', () => {
	test('renders a header and no attack term for level 1', () => {
		render(<HandbookAttacks currentLevel={LEVEL_NAMES.LEVEL_1} />);

		expect(screen.getByText('Attacks')).toBeInTheDocument();
		// make sure no terms are rendered
		expect(screen.queryAllByRole('term')).toHaveLength(0);
	});

	test('renders correct attack items with ARIA roles for level 2', () => {
		render(<HandbookAttacks currentLevel={LEVEL_NAMES.LEVEL_2} />);

		const attackNames = screen
			.getAllByRole('term')
			.map((element) => element.textContent);
		expect(attackNames).toHaveLength(ATTACKS_LEVEL_2.length);

		const attackInformation = screen
			.getAllByRole('definition')
			.map((element) => element.textContent);
		expect(attackInformation).toHaveLength(ATTACKS_LEVEL_2.length);

		ATTACKS_LEVEL_2.forEach(({ name, info }) => {
			expect(attackNames).toContain(name);
			expect(attackInformation).toContain(info);
		});
	});

	test('renders correct attack items with ARIA roles for level 3', () => {
		render(<HandbookAttacks currentLevel={LEVEL_NAMES.LEVEL_3} />);

		const attackNames = screen
			.getAllByRole('term')
			.map((element) => element.textContent);
		expect(attackNames).toHaveLength(ATTACKS_LEVEL_3.length);

		const attackInformation = screen
			.getAllByRole('definition')
			.map((element) => element.textContent);
		expect(attackInformation).toHaveLength(ATTACKS_LEVEL_3.length);

		ATTACKS_LEVEL_3.forEach(({ name, info }) => {
			expect(attackNames).toContain(name);
			expect(attackInformation).toContain(info);
		});
	});

	test('renders correct attack items with ARIA roles for Sandbox', () => {
		render(<HandbookAttacks currentLevel={LEVEL_NAMES.SANDBOX} />);

		const attackNames = screen
			.getAllByRole('term')
			.map((element) => element.textContent);
		expect(attackNames).toHaveLength(ATTACKS_ALL.length);

		const attackInformation = screen
			.getAllByRole('definition')
			.map((element) => element.textContent);
		expect(attackInformation).toHaveLength(ATTACKS_ALL.length);

		ATTACKS_ALL.forEach(({ name, info }) => {
			expect(attackNames).toContain(name);
			expect(attackInformation).toContain(info);
		});
	});
});
