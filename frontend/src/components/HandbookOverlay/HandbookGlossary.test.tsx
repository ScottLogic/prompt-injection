import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import HandbookGlossary from "./HandbookGlossary";

import { GLOSSARY } from "@src/Glossary";
import { LEVEL_NAMES } from "@src/models/level";

describe("HandbookGlossary component tests", () => {
  test("renders a header and no glossary entries", () => {
    render(<HandbookGlossary currentLevel={LEVEL_NAMES.LEVEL_1} />);

    expect(screen.getByText("Glossary")).toBeInTheDocument();
    // make sure no terms are rendered
    expect(screen.queryAllByRole("term")).toHaveLength(0);
  });

  test("renders all glossary entries with ARIA roles for level 2-3", () => {
    render(<HandbookGlossary currentLevel={LEVEL_NAMES.LEVEL_3} />);

    const glossaryTerms = screen
      .getAllByRole("term")
      .map((element) => element.textContent);
    expect(glossaryTerms).toHaveLength(GLOSSARY.length);
    const glossaryDefinitions = screen
      .getAllByRole("definition")
      .map((element) => element.textContent);
    expect(glossaryDefinitions).toHaveLength(GLOSSARY.length);

    GLOSSARY.forEach(({ term, definition }) => {
      expect(glossaryTerms).toContain(term);
      expect(glossaryDefinitions).toContain(definition);
    });
  });
});
