import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import { LEVEL_NAMES } from '@src/models/level';

import { GLOSSARY } from './Glossary';
import HandbookGlossary from './HandbookGlossary';

describe('HandbookGlossary component tests', () => {
	test('renders a header and no glossary entries for level 1', () => {
		render(<HandbookGlossary currentLevel={LEVEL_NAMES.LEVEL_1} />);

		expect(screen.getByText('Glossary')).toBeInTheDocument();
		// make sure no terms are rendered
		expect(screen.queryAllByRole('term')).toHaveLength(0);
	});

	test('renders all glossary entries with ARIA roles for level 2', () => {
		render(<HandbookGlossary currentLevel={LEVEL_NAMES.LEVEL_2} />);

		const glossaryTerms = screen
			.getAllByRole('term')
			.map((element) => element.textContent);
		expect(glossaryTerms).toHaveLength(GLOSSARY.length);
		const glossaryDefinitions = screen
			.getAllByRole('definition')
			.map((element) => element.textContent);
		expect(glossaryDefinitions).toHaveLength(GLOSSARY.length);

		GLOSSARY.forEach(({ term, definition }) => {
			expect(glossaryTerms).toContain(term);
			expect(glossaryDefinitions).toContain(definition);
		});
	});

	test('renders all glossary entries with ARIA roles for level 3', () => {
		render(<HandbookGlossary currentLevel={LEVEL_NAMES.LEVEL_3} />);

		const glossaryTerms = screen
			.getAllByRole('term')
			.map((element) => element.textContent);
		expect(glossaryTerms).toHaveLength(GLOSSARY.length);
		const glossaryDefinitions = screen
			.getAllByRole('definition')
			.map((element) => element.textContent);
		expect(glossaryDefinitions).toHaveLength(GLOSSARY.length);

		GLOSSARY.forEach(({ term, definition }) => {
			expect(glossaryTerms).toContain(term);
			expect(glossaryDefinitions).toContain(definition);
		});
	});

	test('renders all glossary entries with ARIA roles for Sandbox', () => {
		render(<HandbookGlossary currentLevel={LEVEL_NAMES.SANDBOX} />);

		const glossaryTerms = screen
			.getAllByRole('term')
			.map((element) => element.textContent);
		expect(glossaryTerms).toHaveLength(GLOSSARY.length);
		const glossaryDefinitions = screen
			.getAllByRole('definition')
			.map((element) => element.textContent);
		expect(glossaryDefinitions).toHaveLength(GLOSSARY.length);

		GLOSSARY.forEach(({ term, definition }) => {
			expect(glossaryTerms).toContain(term);
			expect(glossaryDefinitions).toContain(definition);
		});
	});
});
