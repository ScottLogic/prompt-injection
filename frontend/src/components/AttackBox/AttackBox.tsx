import "../StrategyBox/StrategyBox.css";
import AttackMechanism from "./AttackMechanism";
import ATTACKS from "../../Attacks";

function AttackBox() {
  return (
    <div id="strategy-box">
      {ATTACKS.map((attack, index) => {
        return <AttackMechanism key={attack.id} attack={attack} />;
      })}
    </div>
  );
}

export default AttackBox;
