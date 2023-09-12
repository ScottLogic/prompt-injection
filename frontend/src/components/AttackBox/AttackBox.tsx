import "../StrategyBox/StrategyBox.css";
import AttackMechanism from "./AttackMechanism";
import { AttackInfo } from "../../models/attack";

function AttackBox({ attacks }: { attacks: AttackInfo[] }) {
  return (
    <div id="strategy-box">
      <div className="side-bar-header">Attacks</div>
      {attacks.map((attack) => {
        return <AttackMechanism key={attack.id} attack={attack} />;
      })}
    </div>
  );
}

export default AttackBox;
