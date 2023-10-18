import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import HandbookGlossary from "./HandbookGlossary";
import { GLOSSARY } from "../../Glossary";

function renderComponent() {
  render(<HandbookGlossary />);
}

describe("HandbookGlossary component tests", () => {
  test("renders all glossary entries with ARIA roles", () => {
    renderComponent();

    const glossaryEntries = screen.getAllByRole("article");
    expect(glossaryEntries).toHaveLength(GLOSSARY.length);

    GLOSSARY.forEach((glossaryEntry) => {
      expect(
        glossaryEntries.some((entry) => {
          return (
            entry.querySelector(`[role="term"]`)?.textContent ===
              glossaryEntry.term &&
            entry.querySelector(`[role="definition"]`)?.textContent ===
              glossaryEntry.definition
          );
        })
      ).toBeTruthy();
    });
  });

  test("all term roles are in h3 elements", () => {
    renderComponent();

    const terms = screen.getAllByRole("term");
    expect(terms).toHaveLength(GLOSSARY.length);

    terms.forEach((term) => {
      expect(term.tagName).toBe("H3");
    });
  });

  test("all definition roles are in p elements", () => {
    renderComponent();

    const definitions = screen.getAllByRole("definition");
    expect(definitions).toHaveLength(GLOSSARY.length);

    definitions.forEach((definition) => {
      expect(definition.tagName).toBe("P");
    });
  });
});
