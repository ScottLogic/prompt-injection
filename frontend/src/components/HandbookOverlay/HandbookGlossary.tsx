import { GLOSSARY } from "../../Glossary";

function HandbookGlossary() {
  return (
    <div className="handbook-attacks">
      {GLOSSARY.map((glossaryEntry) => (
        <span className="attack" key={glossaryEntry.term}>
          <h3>{glossaryEntry.term}</h3>
          <p>{glossaryEntry.definition}</p>
        </span>
      ))}
    </div>
  );
}

export default HandbookGlossary;
