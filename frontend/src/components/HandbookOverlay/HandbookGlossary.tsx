import "./HandbookTerms.css";

import { GLOSSARY } from "@src/Glossary";

function HandbookGlossary() {
  return (
    <dl className="handbook-terms">
      {GLOSSARY.map(({ term, definition }) => (
        <div className="term" key={term}>
          <dt>{term}</dt>
          <dd>{definition}</dd>
        </div>
      ))}
    </dl>
  );
}

export default HandbookGlossary;
