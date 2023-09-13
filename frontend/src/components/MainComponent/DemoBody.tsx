import "./DemoBody.css";
import { ChatMessage } from "../../models/chat";
import {
  DEFENCE_TYPES,
  DefenceConfig,
  DefenceInfo,
} from "../../models/defence";
import { PHASE_NAMES } from "../../models/phase";
import ChatBox from "../ChatBox/ChatBox";
import EmailBox from "../EmailBox/EmailBox";
import { EmailInfo } from "../../models/email";
import { useState } from "react";
import ControlPanel from "../ControlPanel/ControlPanel";

function DemoBody({
  currentPhase,
  defences,
  emails,
  messages,
  addChatMessage,
  resetPhase,
  setDefenceActive,
  setDefenceInactive,
  setDefenceConfiguration,
  setEmails,
  setNumCompletedPhases,
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
  const [completedPhases, setCompletedPhases] = useState<Set<PHASE_NAMES>>(
    new Set()
  );

  function resetPhaseBody() {
    completedPhases.delete(currentPhase);
    setCompletedPhases(completedPhases);
    resetPhase();
  }

  function addCompletedPhase(phase: PHASE_NAMES) {
    completedPhases.add(phase);
    setCompletedPhases(completedPhases);
  }

  return (
    <span id="main-area">
      <div className="side-bar">
        <ControlPanel
          currentPhase={currentPhase}
          defences={defences}
          emails={emails}
          messages={messages}
          addChatMessage={addChatMessage}
          resetPhase={resetPhaseBody}
          setDefenceActive={setDefenceActive}
          setDefenceInactive={setDefenceInactive}
          setDefenceConfiguration={setDefenceConfiguration}
          setEmails={setEmails}
          setNumCompletedPhases={setNumCompletedPhases}
        />
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
