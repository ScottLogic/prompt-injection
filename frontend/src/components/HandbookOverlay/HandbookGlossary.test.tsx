import { getNodeText, render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { GLOSSARY } from "../../Glossary";
import HandbookGlossary from "./HandbookGlossary";

describe("HandbookGlossary component tests", () => {
  test("renders all glossary entries with ARIA roles", () => {
    render(<HandbookGlossary />);

    const glossaryTerms = screen
      .getAllByRole("term")
      .map((element) => element.textContent);
    expect(glossaryTerms).toHaveLength(GLOSSARY.length);

    GLOSSARY.forEach(({ term, definition }) => {
      expect(glossaryTerms).toContain(term);
      expect(
        getNodeText(screen.getByRole("definition", { name: term }))
      ).toEqual(definition);
    });
  });
});
