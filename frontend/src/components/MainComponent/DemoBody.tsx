import "./DemoBody.css";
import { ATTACKS_PHASE_1, ATTACKS_ALL } from "../../Attacks";
import { ChatMessage, CHAT_MESSAGE_TYPE } from "../../models/chat";
import { DefenceInfo } from "../../models/defence";
import { PHASE_NAMES } from "../../models/phase";
import AttackBox from "../AttackBox/AttackBox";
import ChatBox from "../ChatBox/ChatBox";
import DefenceBox from "../DefenceBox/DefenceBox";
import EmailBox from "../EmailBox/EmailBox";
import ExportPDFLink from "../ExportChat/ExportPDFLink";
import ModelSelectionBox from "../ModelSelectionBox/ModelSelectionBox";
import { EmailInfo } from "../../models/email";
import { addInfoMessageToHistory } from "../../service/chatService";

function DemoBody({
  currentPhase,
  defences,
  emails,
  messages,
  addChatMessage,
  resetPhase,
  setEmails,
  setNumCompletedPhases,
}: {
  currentPhase: PHASE_NAMES;
  defences: DefenceInfo[];
  emails: EmailInfo[];
  messages: ChatMessage[];
  addChatMessage: (message: ChatMessage) => void;
  resetPhase: () => void;
  setEmails: (emails: EmailInfo[]) => void;
  setNumCompletedPhases: (numCompletedPhases: number) => void;
}) {
  const addInfoMessage = (message: string) => {
    addChatMessage({
      message: message,
      type: CHAT_MESSAGE_TYPE.INFO,
      isOriginalMessage: true,
    });
    addInfoMessageToHistory(message, CHAT_MESSAGE_TYPE.INFO, currentPhase);
  };

  // methods to be called when defences are (de)activated
  // this adds an info message to the chat
  const defenceActivated = (defenceInfo: DefenceInfo) => {
    const infoMessage = `${defenceInfo.name} defence activated`;
    addInfoMessage(infoMessage.toLowerCase());
  };
  const defenceDeactivated = (defenceInfo: DefenceInfo) => {
    const infoMessage = `${defenceInfo.name} defence deactivated`;
    addInfoMessage(infoMessage.toLowerCase());
  };

  return (
    <span id="main-area">
      <div className="side-bar">
        {/* hide defence box on phases 0 and 1. only allow configuration in sandbox */}
        {/* hide defence box on phases 0 and 1 */}
        {(currentPhase === PHASE_NAMES.PHASE_2 ||
          currentPhase === PHASE_NAMES.SANDBOX) && (
          <DefenceBox
            currentPhase={currentPhase}
            defences={defences}
            showConfigurations={currentPhase > 2 ? true : false}
            defenceActivated={defenceActivated}
            defenceDeactivated={defenceDeactivated}
            switchedPhase={resetPhase}
          />
        )}
        {/* show reduced set of attacks on phase 1 */}
        {currentPhase === PHASE_NAMES.PHASE_1 && (
          <AttackBox attacks={ATTACKS_PHASE_1} />
        )}
        {/* show all attacks on phase 2 and sandbox */}
        {(currentPhase === PHASE_NAMES.PHASE_2 ||
          currentPhase === PHASE_NAMES.SANDBOX) && (
          <AttackBox attacks={ATTACKS_ALL} />
        )}
        <ExportPDFLink
          messages={messages}
          emails={emails}
          currentPhase={currentPhase}
        />
        {/* hide model selection box on phases 0 and 1 */}
        {currentPhase === PHASE_NAMES.SANDBOX && <ModelSelectionBox />}
      </div>
      <div id="centre-area">
        <ChatBox
          messages={messages}
          currentPhase={currentPhase}
          addChatMessage={addChatMessage}
          resetPhase={resetPhase}
          setNumCompletedPhases={setNumCompletedPhases}
          setEmails={setEmails}
        />
      </div>
      <div className="side-bar">
        <EmailBox emails={emails} />
      </div>
    </span>
  );
}

export default DemoBody;
