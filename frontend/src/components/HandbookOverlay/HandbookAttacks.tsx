import { ATTACKS_ALL, ATTACKS_LEVEL_2, ATTACKS_LEVEL_3 } from "../../Attacks";
import { AttackInfo } from "../../models/attack";
import { LEVEL_NAMES } from "../../models/level";
import "./HandbookAttacks.css";

function HandbookAttacks({ currentLevel }: { currentLevel: LEVEL_NAMES }) {
  const levelNameToAttacks = new Map<LEVEL_NAMES, AttackInfo[]>([
    [LEVEL_NAMES.LEVEL_1, []],
    [LEVEL_NAMES.LEVEL_2, ATTACKS_LEVEL_2],
    [LEVEL_NAMES.LEVEL_3, ATTACKS_LEVEL_3],
    [LEVEL_NAMES.SANDBOX, ATTACKS_ALL]
  ]
  )

  const attacks = levelNameToAttacks.get(currentLevel) ?? ATTACKS_ALL;

  return (
    <div className="handbook-attacks">
      {attacks.map((attack) => (
        <article className="attack" key={attack.id}>
          <h3 role="term">{attack.name}</h3>
          <p role="definition">{attack.info}</p>
        </article>
      ))}
    </div>
  );
}

export default HandbookAttacks;
