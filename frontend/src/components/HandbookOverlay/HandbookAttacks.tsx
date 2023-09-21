import { ATTACKS_ALL, ATTACKS_LEVEL_2 } from "../../Attacks";
import { AttackInfo } from "../../models/attack";
import { LEVEL_NAMES } from "../../models/level";
import "./HandbookAttacks.css";

function HandbookAttacks({ currentLevel }: { currentLevel: LEVEL_NAMES }) {
  function getAttacks(): AttackInfo[] {
    // what attacks to show depends on the level
    switch (currentLevel) {
      case LEVEL_NAMES.LEVEL_1:
      // fallthrough
      case LEVEL_NAMES.LEVEL_2:
        return ATTACKS_LEVEL_2;
      default:
        return ATTACKS_ALL;
    }
  }

  return (
    <div>
      <h2>Attacks</h2>
      <div id="handbook-attacks">
        {getAttacks().map((attack) => {
          return (
            <span className="handbook-attack" key={attack.id}>
              <h3>{attack.name}</h3>
              <p>{attack.info}</p>
            </span>
          );
        })}
      </div>
    </div>
  );
}

export default HandbookAttacks;
