import { useState } from "react";
import { AttackInfo } from "../../models/attack";
import "../StrategyBox/StrategyMechanism.css";

function DefenceMechanism({ attack }: { attack: AttackInfo }) {
  const [isInfoBoxVisible, setIsInfoBoxVisible] = useState(false);

  function toggleAttackInfo() {
    setIsInfoBoxVisible(!isInfoBoxVisible);
  }

  return (
    <span>
      <div className="strategy-mechanism" onClick={toggleAttackInfo}>
        <div className="strategy-mechanism-header">
          <span>{attack.name}</span>
        </div>
        {isInfoBoxVisible ? (
          <div className="strategy-mechanism-info-box">{attack.info}</div>
        ) : null}
      </div>
    </span>
  );
}

export default DefenceMechanism;
