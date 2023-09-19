import "./ControlPanel.css";
import { ATTACKS_LEVEL_2, ATTACKS_ALL } from "../../Attacks";
import { ChatMessage } from "../../models/chat";
import {
  DEFENCE_TYPES,
  DefenceConfig,
  DefenceInfo,
} from "../../models/defence";
import { LEVEL_NAMES } from "../../models/level";
import AttackBox from "../AttackBox/AttackBox";
import DefenceBox from "../DefenceBox/DefenceBox";
import ModelBox from "../ModelBox/ModelBox";
import { EmailInfo } from "../../models/email";
import DocumentViewButton from "../DocumentViewer/DocumentViewButton";

function ControlPanel({
  currentLevel,
  defences,
  setDefenceActive,
  setDefenceInactive,
  setDefenceConfiguration,
}: {
  currentLevel: LEVEL_NAMES;
  defences: DefenceInfo[];
  messages: ChatMessage[];
  addChatMessage: (message: ChatMessage) => void;
  setDefenceActive: (defence: DefenceInfo) => void;
  setDefenceInactive: (defence: DefenceInfo) => void;
  setDefenceConfiguration: (
    defenceId: DEFENCE_TYPES,
    config: DefenceConfig[]
  ) => Promise<boolean>;
  setEmails: (emails: EmailInfo[]) => void;
  setNumCompletedLevels: (numCompletedLevels: number) => void;
}) {
  return (
    <div id="control-panel">
      <div id="control-strategy">
        {/* show reduced set of attacks on level 2 */}
        {currentLevel === LEVEL_NAMES.LEVEL_2 && (
          <AttackBox attacks={ATTACKS_LEVEL_2} />
        )}
        {/* show all attacks on level 3 and sandbox */}
        {(currentLevel === LEVEL_NAMES.LEVEL_3 ||
          currentLevel === LEVEL_NAMES.SANDBOX) && (
          <AttackBox attacks={ATTACKS_ALL} />
        )}
        {/* hide defence box on levels 1 and 2 */}
        {(currentLevel === LEVEL_NAMES.LEVEL_3 ||
          currentLevel === LEVEL_NAMES.SANDBOX) && (
          <DefenceBox
            currentLevel={currentLevel}
            defences={defences}
            showConfigurations={
              // only allow configuration in sandbox
              currentLevel === LEVEL_NAMES.SANDBOX ? true : false
            }
            setDefenceActive={setDefenceActive}
            setDefenceInactive={setDefenceInactive}
            setDefenceConfiguration={setDefenceConfiguration}
          />
        )}
        {/* only show model selection box in sandbox mode */}
        {currentLevel === LEVEL_NAMES.SANDBOX && <ModelBox />}
        {/* only show document viewer button in sandbox mode */}
        {currentLevel === LEVEL_NAMES.SANDBOX && <DocumentViewButton />}
      </div>
    </div>
  );
}

export default ControlPanel;
