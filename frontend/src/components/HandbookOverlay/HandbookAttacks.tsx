import { ATTACKS_ALL, ATTACKS_LEVEL_2 } from "../../Attacks";
import { AttackInfo } from "../../models/attack";
import { LEVEL_NAMES } from "../../models/level";
import "./HandbookTerms.css";

function HandbookAttacks({ currentLevel }: { currentLevel: LEVEL_NAMES }) {
  const attacks: AttackInfo[] =
    currentLevel === LEVEL_NAMES.LEVEL_2 ? ATTACKS_LEVEL_2 : ATTACKS_ALL;

  return (
    <div className="handbook-terms">
      {attacks.map((attack) => (
        <article className="term" key={attack.id}>
          <h3 role="term">{attack.name}</h3>
          <p role="definition">{attack.info}</p>
        </article>
      ))}
    </div>
  );
}

export default HandbookAttacks;
