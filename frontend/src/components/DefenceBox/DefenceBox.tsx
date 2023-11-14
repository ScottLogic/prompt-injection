import "./DefenceBox.css";
import DefenceMechanism from "./DefenceMechanism";

import { DEFENCE_TYPES, DefenceConfig, DefenceInfo } from "@src/models/defence";

function DefenceBox({
  defences,
  showConfigurations,
  setDefenceActive,
  setDefenceInactive,
  setDefenceConfiguration,
}: {
  currentLevel: number;
  defences: DefenceInfo[];
  showConfigurations: boolean;
  setDefenceActive: (defence: DefenceInfo) => void;
  setDefenceInactive: (defence: DefenceInfo) => void;
  setDefenceConfiguration: (
    defenceId: DEFENCE_TYPES,
    config: DefenceConfig[]
  ) => Promise<boolean>;
}) {
  return (
    <div className="defence-box">
      {defences.map((defence, index) => {
        return (
          <DefenceMechanism
            key={index}
            defenceDetail={defence}
            showConfigurations={showConfigurations}
            setDefenceActive={setDefenceActive}
            setDefenceInactive={setDefenceInactive}
            setDefenceConfiguration={setDefenceConfiguration}
          />
        );
      })}
    </div>
  );
}

export default DefenceBox;
