import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import HandbookGlossary from "./HandbookGlossary";

import { GLOSSARY } from "@src/Glossary";

describe("HandbookGlossary component tests", () => {
  test("renders all glossary entries with ARIA roles", () => {
    render(<HandbookGlossary />);

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
