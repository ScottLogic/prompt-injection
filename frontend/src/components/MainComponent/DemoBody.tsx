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
import { addMessageToChatHistory } from "../../service/chatService";
import { useState } from "react";
import DocumentViewButton from "../DocumentViewer/DocumentViewButton";

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
  const [completedPhases, setCompletedPhases] = useState<Set<PHASE_NAMES>>(
    new Set()
  );

  function addCompletedPhase(phase: PHASE_NAMES) {
    completedPhases.add(phase);
    setCompletedPhases(completedPhases);
  }

  function resetButtonClicked() {
    completedPhases.delete(currentPhase);
    setCompletedPhases(completedPhases);
    resetPhase();
  }

  function addInfoMessage(message: string) {
    addChatMessage({
      message: message,
      type: CHAT_MESSAGE_TYPE.INFO,
    });
    // asynchronously add the message to the chat history
    void addMessageToChatHistory(message, CHAT_MESSAGE_TYPE.INFO, currentPhase);
  }

  // methods to be called when defences are (de)activated
  // this adds an info message to the chat
  function defenceActivated(defenceInfo: DefenceInfo) {
    const infoMessage = `${defenceInfo.name} defence activated`;
    addInfoMessage(infoMessage.toLowerCase());
  }

  function defenceDeactivated(defenceInfo: DefenceInfo) {
    const infoMessage = `${defenceInfo.name} defence deactivated`;
    addInfoMessage(infoMessage.toLowerCase());
  }

  return (
    <span id="main-area">
      <div className="side-bar">
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
            defenceActivated={defenceActivated}
            defenceDeactivated={defenceDeactivated}
          />
        )}
        {/* hide model selection box on phases 0 and 1 */}
        {currentPhase === PHASE_NAMES.SANDBOX && <ModelSelectionBox />}
        {currentPhase === PHASE_NAMES.SANDBOX && <DocumentViewButton />}

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
            onClick={resetButtonClicked}
          >
            Reset
          </button>
        </div>
      </div>
      <div id="centre-area">
        <ChatBox
          messages={messages}
          completedPhases={completedPhases}
          currentPhase={currentPhase}
          addChatMessage={addChatMessage}
          addCompletedPhase={addCompletedPhase}
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
