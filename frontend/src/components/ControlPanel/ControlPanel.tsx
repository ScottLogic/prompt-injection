import "./ControlPanel.css";
import { ChatMessage } from "../../models/chat";
import {
  DEFENCE_TYPES,
  DefenceConfig,
  DefenceInfo,
} from "../../models/defence";
import { LEVEL_NAMES } from "../../models/level";
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
  function getDefencesConfigure() {
    return defences.filter((defence) => {
      return ![
        DEFENCE_TYPES.EVALUATION_LLM_INSTRUCTIONS,
        DEFENCE_TYPES.QA_LLM_INSTRUCTIONS,
        DEFENCE_TYPES.SYSTEM_ROLE,
      ].some((id) => id === defence.id);
    });
  }

  function getDefencesModel() {
    return defences.filter((defence) => {
      return [
        DEFENCE_TYPES.EVALUATION_LLM_INSTRUCTIONS,
        DEFENCE_TYPES.QA_LLM_INSTRUCTIONS,
        DEFENCE_TYPES.SYSTEM_ROLE,
      ].some((id) => id === defence.id);
    });
  }

  return (
    <div id="control-panel">
      {/* hide defence box on levels 1 and 2 */}
      {(currentLevel === LEVEL_NAMES.LEVEL_3 ||
        currentLevel === LEVEL_NAMES.SANDBOX) && (
        <details className="control-collapsible-section">
          <summary className="control-collapsible-section-header">
            Defence Configuration
          </summary>
          <DefenceBox
            currentLevel={currentLevel}
            defences={getDefencesConfigure()}
            showConfigurations={
              // only allow configuration in sandbox
              currentLevel === LEVEL_NAMES.SANDBOX ? true : false
            }
            setDefenceActive={setDefenceActive}
            setDefenceInactive={setDefenceInactive}
            setDefenceConfiguration={setDefenceConfiguration}
          />
        </details>
      )}
      {/* only show model selection box in sandbox mode */}
      {currentLevel === LEVEL_NAMES.SANDBOX && (
        <details className="control-collapsible-section">
          <summary className="control-collapsible-section-header">
            Model Configuration
          </summary>
          <DefenceBox
            currentLevel={currentLevel}
            defences={getDefencesModel()}
            showConfigurations={true}
            setDefenceActive={setDefenceActive}
            setDefenceInactive={setDefenceInactive}
            setDefenceConfiguration={setDefenceConfiguration}
          />
          <ModelBox />
        </details>
      )}
      {/* only show document viewer button in sandbox mode */}
      {currentLevel === LEVEL_NAMES.SANDBOX && <DocumentViewButton />}
    </div>
  );
}

export default ControlPanel;
