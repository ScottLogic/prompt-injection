import { useState } from "react";
import { useEffect } from "react";

import "./DemoBody.css";
import { ATTACKS_PHASE_1, ATTACKS_ALL } from "../../Attacks";
import { DEFENCE_DETAILS_ALL } from "../../Defences";
import { ChatMessage, CHAT_MESSAGE_TYPE } from "../../models/chat";
import { DefenceInfo } from "../../models/defence";
import { PHASE_NAMES } from "../../models/phase";
import { getCompletedPhases } from "../../service/phaseService";
import AttackBox from "../AttackBox/AttackBox";
import ChatBox from "../ChatBox/ChatBox";
import DefenceBox from "../DefenceBox/DefenceBox";
import EmailBox from "../EmailBox/EmailBox";
import ExportPDFLink from "../ExportChat/ExportPDFLink";
import ModelSelectionBox from "../ModelSelectionBox/ModelSelectionBox";
import { EmailInfo } from "../../models/email";

function DemoBody(
  {
    currentPhase,
    defences,
    emails,
    messages,
    setEmails,
    setMessages,
    setNewPhase,
    setNumCompletedPhases,
  }: {
    currentPhase: PHASE_NAMES;
    defences: DefenceInfo[];
    emails: EmailInfo[];
    messages: ChatMessage[];
    setEmails: (emails: EmailInfo[]) => void;
    setMessages: (messages: ChatMessage[]) => void;
    setNewPhase: (newPhase: PHASE_NAMES) => void;
    setNumCompletedPhases: (numCompletedPhases: number) => void;
  }
) {
  const [triggeredDefences, setTriggeredDefences] = useState<string[]>([]);

  const updateTriggeredDefences = (defenceDetails: string[]) => {
    // set the new triggered defences
    setTriggeredDefences(defenceDetails);
    // add a message to the chat
    defenceDetails.forEach((defence) => {
      defenceTriggered(defence);
    });
  };

  // methods to modify messages
  const addChatMessage = (message: ChatMessage) => {
    setMessages([...messages, message]);
  };
  const addInfoMessage = (message: string) => {
    addChatMessage({
      message: message,
      type: CHAT_MESSAGE_TYPE.INFO,
      isOriginalMessage: true,
    });
  };

  const addDefenceTriggeredMessage = (message: string) => {
    addChatMessage({
      message: message,
      type: CHAT_MESSAGE_TYPE.DEFENCE_TRIGGERED,
      isOriginalMessage: true,
    });
  };

  const clearMessages = () => {
    // resetting the current phase will also reset the messages
    setNewPhase(currentPhase);
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

  // add a message to the chat when a defence is triggered
  const defenceTriggered = (id: String) => {
    const defenceInfo = DEFENCE_DETAILS_ALL.find(
      (defence) => defence.id === id
    )?.name;
    const infoMessage = `${defenceInfo} defence triggered`;
    addDefenceTriggeredMessage(infoMessage.toLowerCase());
  };

  // called on mount
  useEffect(() => {
    getCompletedPhases().then((numCompletedPhases) => {
      setNumCompletedPhases(numCompletedPhases);
    });
    setNewPhase(currentPhase);
  }, []);

  return (
    <span id="main-area">
      <div className="side-bar">
        {/* hide defence box on phases 0 and 1. only allow configuration in sandbox */}
        {/* hide defence box on phases 0 and 1 */}
        {(currentPhase === PHASE_NAMES.PHASE_2 ||
          currentPhase === PHASE_NAMES.SANDBOX) && (
          <DefenceBox
            defences={defences}
            showConfigurations={currentPhase > 2 ? true : false}
            triggeredDefences={triggeredDefences}
            defenceActivated={defenceActivated}
            defenceDeactivated={defenceDeactivated}
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
          setNumCompletedPhases={setNumCompletedPhases}
          setEmails={setEmails}
          updateTriggeredDefences={updateTriggeredDefences}
          addChatMessage={addChatMessage}
          clearMessages={clearMessages}
        />
      </div>
      <div className="side-bar">
        <EmailBox emails={emails} />
      </div>
    </span>
  );
}

export default DemoBody;
