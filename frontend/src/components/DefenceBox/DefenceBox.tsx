import "./DefenceBox.css";
import DefenceMechanism from "./DefenceMechanism";

import {
  DEFENCE_ID,
  DefenceConfigItem,
  DefenceInfo,
} from "@src/models/defence";

function DefenceBox({
  defences,
  showConfigurations,
  resetDefenceConfiguration,
  setDefenceActive,
  setDefenceInactive,
  setDefenceConfiguration,
}: {
  currentLevel: number;
  defences: DefenceInfo[];
  showConfigurations: boolean;
  resetDefenceConfiguration: (defenceId: DEFENCE_ID, configId: string) => void;
  setDefenceActive: (defence: DefenceInfo) => void;
  setDefenceInactive: (defence: DefenceInfo) => void;
  setDefenceConfiguration: (
    defenceId: DEFENCE_ID,
    config: DefenceConfigItem[]
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
            resetDefenceConfiguration={resetDefenceConfiguration}
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
