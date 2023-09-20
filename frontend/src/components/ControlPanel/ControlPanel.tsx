import "./ControlPanel.css";
import { ChatMessage } from "../../models/chat";
import {
  DEFENCE_TYPES,
  DefenceConfig,
  DefenceInfo,
} from "../../models/defence";
import { LEVEL_NAMES } from "../../models/level";
import DefenceBox from "../DefenceBox/DefenceBox";
import ExportPDFLink from "../ExportChat/ExportPDFLink";
import ModelBox from "../ModelBox/ModelBox";
import { EmailInfo } from "../../models/email";
import DocumentViewButton from "../DocumentViewer/DocumentViewButton";

function ControlPanel({
  currentLevel,
  defences,
  emails,
  messages,
  resetLevel,
  setDefenceActive,
  setDefenceInactive,
  setDefenceConfiguration,
}: {
  currentLevel: LEVEL_NAMES;
  defences: DefenceInfo[];
  emails: EmailInfo[];
  messages: ChatMessage[];
  addChatMessage: (message: ChatMessage) => void;
  resetLevel: () => void;
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

      <div id="control-buttons">
        <div className="control-button">
          <ExportPDFLink
            messages={messages}
            emails={emails}
            currentLevel={currentLevel}
          />
        </div>
        <button
          className="prompt-injection-button control-button"
          onClick={resetLevel}
        >
          Reset
        </button>
      </div>
    </div>
  );
}

export default ControlPanel;
