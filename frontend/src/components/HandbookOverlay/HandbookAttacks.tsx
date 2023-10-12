import { ATTACKS_ALL, ATTACKS_LEVEL_2 } from "../../Attacks";
import { AttackInfo } from "../../models/attack";
import { LEVEL_NAMES } from "../../models/level";
import "./HandbookAttacks.css";

function HandbookAttacks({ currentLevel }: { currentLevel: LEVEL_NAMES }) {
  const attacks: AttackInfo[] =
    currentLevel === LEVEL_NAMES.LEVEL_2 ? ATTACKS_LEVEL_2 : ATTACKS_ALL;

  return (
    <div className="handbook-attacks">
      {attacks.map((attack) => (
        <span className="attack" key={attack.id}>
          <h3>{attack.name}</h3>
          <p>{attack.info}</p>
        </span>
      ))}
    </div>
  );
}

export default HandbookAttacks;
