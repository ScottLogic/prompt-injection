import "./ControlPanel.css";
import { ATTACKS_PHASE_1, ATTACKS_ALL } from "../../Attacks";
import { ChatMessage } from "../../models/chat";
import {
  DEFENCE_TYPES,
  DefenceConfig,
  DefenceInfo,
} from "../../models/defence";
import { PHASE_NAMES } from "../../models/phase";
import AttackBox from "../AttackBox/AttackBox";
import DefenceBox from "../DefenceBox/DefenceBox";
import ExportPDFLink from "../ExportChat/ExportPDFLink";
import ModelBox from "../ModelBox/ModelBox";
import { EmailInfo } from "../../models/email";
import DocumentViewButton from "../DocumentViewer/DocumentViewButton";

function ControlPanel({
  currentPhase,
  defences,
  emails,
  messages,
  resetPhase,
  setDefenceActive,
  setDefenceInactive,
  setDefenceConfiguration,
}: {
  currentPhase: PHASE_NAMES;
  defences: DefenceInfo[];
  emails: EmailInfo[];
  messages: ChatMessage[];
  addChatMessage: (message: ChatMessage) => void;
  resetPhase: () => void;
  setDefenceActive: (defence: DefenceInfo) => void;
  setDefenceInactive: (defence: DefenceInfo) => void;
  setDefenceConfiguration: (
    defenceId: DEFENCE_TYPES,
    config: DefenceConfig[]
  ) => Promise<boolean>;
  setEmails: (emails: EmailInfo[]) => void;
  setNumCompletedPhases: (numCompletedPhases: number) => void;
}) {
  return (
    <div id="control-panel">
      <div id="control-strategy">
        {/* show reduced set of attacks on phase 1 */}
        {currentPhase === PHASE_NAMES.PHASE_1 && (
          <AttackBox attacks={ATTACKS_PHASE_1} />
        )}
        {/* show all attacks on phase 2 and sandbox */}
        {(currentPhase === PHASE_NAMES.PHASE_2 ||
          currentPhase === PHASE_NAMES.SANDBOX) && (
          <AttackBox attacks={ATTACKS_ALL} />
        )}
        {/* hide defence box on phases 0 and 1. only allow configuration in sandbox */}
        {(currentPhase === PHASE_NAMES.PHASE_2 ||
          currentPhase === PHASE_NAMES.SANDBOX) && (
          <DefenceBox
            currentPhase={currentPhase}
            defences={defences}
            showConfigurations={
              currentPhase > PHASE_NAMES.PHASE_2 ? true : false
            }
            setDefenceActive={setDefenceActive}
            setDefenceInactive={setDefenceInactive}
            setDefenceConfiguration={setDefenceConfiguration}
          />
        )}
        {/* hide model selection box on phases 0 and 1 */}
        {currentPhase === PHASE_NAMES.SANDBOX && <ModelBox />}
        {currentPhase === PHASE_NAMES.SANDBOX && <DocumentViewButton />}
      </div>

      <div id="control-buttons">
        <div className="control-button">
          <ExportPDFLink
            messages={messages}
            emails={emails}
            currentPhase={currentPhase}
          />
        </div>
        <button
          className="prompt-injection-button control-button"
          onClick={resetPhase}
        >
          Reset
        </button>
      </div>
    </div>
  );
}

export default ControlPanel;
