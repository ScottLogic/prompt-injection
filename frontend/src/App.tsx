import "./App.css";
import "./Theme.css";
import DemoHeader from "./components/MainComponent/DemoHeader";
import DemoBody from "./components/MainComponent/DemoBody";
import { useState } from "react";
import { PHASE_NAMES } from "./models/phase";
import { clearChat } from "./service/chatService";
import { EmailInfo } from "./models/email";
import { clearEmails } from "./service/emailService";
import { CHAT_MESSAGE_TYPE, ChatMessage } from "./models/chat";
import { resetActiveDefences } from "./service/defenceService";
import { PHASES } from "./Phases";
import { DEFENCE_DETAILS_ALL, DEFENCE_DETAILS_PHASE } from "./Defences";
import { DefenceInfo } from "./models/defence";

function App() {
  // start on sandbox mode
  const [currentPhase, setCurrentPhase] = useState<PHASE_NAMES>(
    PHASE_NAMES.SANDBOX
  );
  const [numCompletedPhases, setNumCompletedPhases] = useState<number>(0);
  
  const [defencesToShow, setDefencesToShow] =
    useState<DefenceInfo[]>(DEFENCE_DETAILS_ALL);
  const [emails, setEmails] = useState<EmailInfo[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  
  const addChatMessage = (message: ChatMessage) => {
    setMessages((messages: ChatMessage[]) => [...messages, message]);
  };

  const addPhasePreambleMessage = (message: string) => {
    addChatMessage({
      message: message,
      type: CHAT_MESSAGE_TYPE.PHASE_INFO,
      isOriginalMessage: true,
    });
  };

  const clearEmailBox = () => {
    setEmails([]);
    clearEmails();
  };

  const setNewPhase = (newPhase: PHASE_NAMES) => {
    // reset emails and messages from front and backend
    clearChat();
    clearEmailBox();
    // clear frontend messages
    setMessages([]);
    setCurrentPhase(newPhase);

    resetActiveDefences();

    // add the preamble to the chat
    const preambleMessage = PHASES[newPhase].preamble;
    addPhasePreambleMessage(preambleMessage.toLowerCase());

    // choose appropriate defences to display
    newPhase === PHASE_NAMES.PHASE_2
      ? setDefencesToShow(DEFENCE_DETAILS_PHASE)
      : setDefencesToShow(DEFENCE_DETAILS_ALL);
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
          setEmails={setEmails}
          setMessages={setMessages}
          setNewPhase={setNewPhase}
          setNumCompletedPhases={setNumCompletedPhases}
        />
      </div>
    </div>
  );
}

export default App;
