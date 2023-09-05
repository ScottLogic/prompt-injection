import "./App.css";
import "./Theme.css";
import DemoHeader from "./components/MainComponent/DemoHeader";
import DemoBody from "./components/MainComponent/DemoBody";
import { useEffect, useState } from "react";
import { PHASE_NAMES } from "./models/phase";
import {
  getChatHistory,
  clearChat,
} from "./service/chatService";
import { EmailInfo } from "./models/email";
import { clearEmails, getSentEmails } from "./service/emailService";
import { CHAT_MESSAGE_TYPE, ChatMessage } from "./models/chat";
import { resetActiveDefences } from "./service/defenceService";
import { DEFENCE_DETAILS_ALL, DEFENCE_DETAILS_PHASE } from "./Defences";
import { DefenceInfo } from "./models/defence";
import { getCompletedPhases } from "./service/phaseService";
import { PHASES } from "./Phases";

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

  // called on mount
  useEffect(() => {
    getCompletedPhases().then((numCompletedPhases) => {
      setNumCompletedPhases(numCompletedPhases);
    }).catch((err) => {
      console.log(err);
    });
    void setNewPhase(currentPhase);
  }, []);

  // methods to modify messages
  function addChatMessage(message: ChatMessage) {
    setMessages((messages: ChatMessage[]) => [...messages, message]);
  }

  // for clearing phase progress
  async function resetPhase() {
    console.log(`resetting phase ${  currentPhase}`);

    await clearChat(currentPhase);
    setMessages([]);
    // add preamble to start of chat
    addChatMessage({
      message: PHASES[currentPhase].preamble,
      type: CHAT_MESSAGE_TYPE.PHASE_INFO,
    });

    await clearEmails(currentPhase);
    setEmails([]);

    await resetActiveDefences(currentPhase);
    // choose appropriate defences to display
    let defences =
      currentPhase === PHASE_NAMES.PHASE_2
        ? DEFENCE_DETAILS_PHASE
        : DEFENCE_DETAILS_ALL;
    defences = defences.map((defence) => {
      defence.isActive = false;
      return defence;
    });
    setDefencesToShow(defences);
  }

  // for going switching phase without clearing progress
  async function setNewPhase(newPhase: PHASE_NAMES) {
    console.log(`changing phase from ${  currentPhase  } to ${  newPhase}`);
    setMessages([]);
    setCurrentPhase(newPhase);

    // get emails for new phase from the backend
    const phaseEmails = await getSentEmails(newPhase);
    setEmails(phaseEmails);

    // get chat history for new phase from the backend
    const phaseChatHistory = await getChatHistory(newPhase);
    // add the preamble to the start of the chat history
    phaseChatHistory.unshift({
      message: PHASES[newPhase].preamble,
      type: CHAT_MESSAGE_TYPE.PHASE_INFO,
    });
    setMessages(phaseChatHistory);

    const defences =
      newPhase === PHASE_NAMES.PHASE_2
        ? DEFENCE_DETAILS_PHASE
        : DEFENCE_DETAILS_ALL;
    setDefencesToShow(defences);
  }

  return (
    <div id="app-content">
      <div id="app-content-header">
        <DemoHeader
          currentPhase={currentPhase}
          numCompletedPhases={numCompletedPhases}
          setNewPhase={() => {void setNewPhase}}
        />
      </div>
      <div id="app-content-body">
        <DemoBody
          currentPhase={currentPhase}
          defences={defencesToShow}
          emails={emails}
          messages={messages}
          addChatMessage={addChatMessage}
          resetPhase={() => void resetPhase}
          setEmails={setEmails}
          setNumCompletedPhases={setNumCompletedPhases}
        />
      </div>
    </div>
  );
}

export default App;
