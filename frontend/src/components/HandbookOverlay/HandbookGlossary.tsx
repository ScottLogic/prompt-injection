import { GLOSSARY } from "../../Glossary";
import "./HandbookGlossary.css";

function HandbookGlossary() {
  return (
    <dl className="handbook-terms">
      {GLOSSARY.map(({ term, definition }) => (
        <div className="term" key={term}>
          <dt>{term}</dt>
          <dd aria-label={term}>{definition}</dd>
        </div>
      ))}
    </dl>
  );
}

export default HandbookGlossary;
