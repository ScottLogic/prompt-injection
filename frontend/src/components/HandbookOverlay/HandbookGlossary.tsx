import { GLOSSARY } from "../../Glossary";
import "./HandbookTerms.css";

function HandbookGlossary() {
  return (
    <div className="handbook-terms">
      {GLOSSARY.map((glossaryEntry) => (
        <article className="term" key={glossaryEntry.term}>
          <h3 role="term">{glossaryEntry.term}</h3>
          <p role="definition">{glossaryEntry.definition}</p>
        </article>
      ))}
    </div>
  );
}

export default HandbookGlossary;
