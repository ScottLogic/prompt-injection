import "./App.css";
import "./Theme.css";
import DemoHeader from "./components/MainComponent/DemoHeader";
import DemoBody from "./components/MainComponent/DemoBody";
import { useEffect, useState } from "react";
import { PHASE_NAMES } from "./models/phase";
import { clearChat } from "./service/chatService";
import { EmailInfo } from "./models/email";
import { clearEmails } from "./service/emailService";
import { CHAT_MESSAGE_TYPE, ChatMessage } from "./models/chat";
import { resetActiveDefences } from "./service/defenceService";
import { PHASES } from "./Phases";
import { DEFENCE_DETAILS_ALL, DEFENCE_DETAILS_PHASE } from "./Defences";
import { DefenceInfo } from "./models/defence";
import { getCompletedPhases } from "./service/phaseService";

function App() {
  // start on sandbox mode
  const [currentPhase, setCurrentPhase] = useState<PHASE_NAMES>(PHASE_NAMES.SANDBOX);
  const [numCompletedPhases, setNumCompletedPhases] = useState<number>(0);
  
  const [defencesToShow, setDefencesToShow] =
    useState<DefenceInfo[]>(DEFENCE_DETAILS_ALL);
  const [emails, setEmails] = useState<EmailInfo[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // called on mount
  useEffect(() => {
    getCompletedPhases().then((numCompletedPhases) => {
      setNumCompletedPhases(numCompletedPhases);
    });
    setNewPhase(currentPhase);
  }, []);
  
  function addChatMessage(message: ChatMessage) {
    setMessages((messages: ChatMessage[]) => [...messages, message]);
  };

  function addPhasePreambleMessage (message: string) {
    addChatMessage({
      message: message,
      type: CHAT_MESSAGE_TYPE.PHASE_INFO,
      isOriginalMessage: true,
    });
  };

  function resetPhase() {
    setNewPhase(currentPhase);
  }

  function setNewPhase(newPhase: PHASE_NAMES) {
    setCurrentPhase(newPhase);

    // reset remove emails
    clearEmails();
    // reset local emails
    setEmails([]);

    // reset remove chat
    clearChat();
    // reset local chat
    setMessages([]);

    // reset remote defences
    resetActiveDefences();
    // choose appropriate defences to display
    let defences = newPhase === PHASE_NAMES.PHASE_2
      ? DEFENCE_DETAILS_PHASE
      : DEFENCE_DETAILS_ALL;
    // make all defences inactive
    defences = defences.map((defence) => {
      defence.isActive = false;
      return defence;
    });
    setDefencesToShow(defences);

    // add the preamble to the chat
    const preambleMessage = PHASES[newPhase].preamble;
    addPhasePreambleMessage(preambleMessage.toLowerCase());
  };

  return (
    <div id="app-content">
      <div id="app-content-header">
        <DemoHeader 
          currentPhase={currentPhase}
          numCompletedPhases={numCompletedPhases}
          setNewPhase={setNewPhase}
        />
      </div>
      <div id="app-content-body">
        <DemoBody 
          currentPhase={currentPhase}
          defences={defencesToShow}
          emails={emails}
          messages={messages}
          addChatMessage={addChatMessage}
          resetPhase={resetPhase}
          setEmails={setEmails}
          setNumCompletedPhases={setNumCompletedPhases}
        />
      </div>
    </div>
  );
}

export default App;
