import "./App.css";
import "./Theme.css";
import DemoHeader from "./components/MainComponent/DemoHeader";
import DemoBody from "./components/MainComponent/DemoBody";
import { useEffect, useState } from "react";
import { PHASE_NAMES } from "./models/phase";
import {
  getChatHistory,
  addInfoMessageToHistory,
  clearChat,
} from "./service/chatService";
import { EmailInfo } from "./models/email";
import { clearEmails, getSentEmails } from "./service/emailService";
import { CHAT_MESSAGE_TYPE, ChatMessage } from "./models/chat";
import { resetActiveDefences } from "./service/defenceService";
import { DEFENCE_DETAILS_ALL, DEFENCE_DETAILS_PHASE } from "./Defences";
import { DefenceInfo } from "./models/defence";
import { getCompletedPhases } from "./service/phaseService";

function App() {
  // start on sandbox mode
  const [currentPhase, setCurrentPhase] = useState<PHASE_NAMES>(
    PHASE_NAMES.SANDBOX
  );
  const [numCompletedPhases, setNumCompletedPhases] = useState<number>(0);

  const [defencesToShow, setDefencesToShow] =
    useState<DefenceInfo[]>(DEFENCE_DETAILS_ALL);
  const [triggeredDefences, setTriggeredDefences] = useState<string[]>([]);
  const [emails, setEmails] = useState<EmailInfo[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // called on mount
  useEffect(() => {
    getCompletedPhases().then((numCompletedPhases) => {
      setNumCompletedPhases(numCompletedPhases);
    });
    setNewPhase(currentPhase);
  }, []);

  // const updateTriggeredDefences = (defenceDetails: string[]) => {
  //   // set the new triggered defences
  //   setTriggeredDefences(defenceDetails);
  //   // add a message to the chat
  //   defenceDetails.forEach((defence) => {
  //     defenceTriggered(defence);
  //   });
  // };

  // methods to modify messages
  const addChatMessage = (message: ChatMessage) => {
    setMessages((messages: ChatMessage[]) => [...messages, message]);
  };

  const addDefenceTriggeredMessage = (message: string) => {
    addChatMessage({
      message: message,
      type: CHAT_MESSAGE_TYPE.DEFENCE_TRIGGERED,
      isOriginalMessage: true,
    });
    addInfoMessageToHistory(message, currentPhase);
  };

  // for clearing phase progress
  function resetPhase() {
    console.log("resetting phase " + currentPhase);
    clearChat(currentPhase).then(() => {
      setMessages([]);
    });
    clearEmails(currentPhase).then(() => {
      setEmails([]);
    });
    resetActiveDefences(currentPhase).then(() => {
      setTriggeredDefences([]);
    });
  }

  // for going switching phase - not clearing progress
  const setNewPhase = (newPhase: PHASE_NAMES) => {
    console.log("changing phase from " + currentPhase + " to " + newPhase);
    setCurrentPhase(newPhase);

    // get emails for new phase from the backend
    getSentEmails(newPhase).then((phaseEmails) => {
      setEmails(phaseEmails);
    });

    // get chat history for new phase from the backend
    getChatHistory(newPhase).then((phaseChatHistory) => {
      setMessages(phaseChatHistory);
    });

    // add the preamble to the chat
    // const preambleMessage = PHASES[newPhase].preamble;
    // addPhasePreambleMessage(preambleMessage.toLowerCase());

    // choose appropriate defences to display
    let defences =
      newPhase === PHASE_NAMES.PHASE_2
        ? DEFENCE_DETAILS_PHASE
        : DEFENCE_DETAILS_ALL;
    // make all defences inactive
    defences = defences.map((defence) => {
      defence.isActive = false;
      return defence;
    });
    setDefencesToShow(defences);
  };

  //a add a message to the chat when a defence is triggered
  const defenceTriggered = (id: String) => {
    const defenceInfo = DEFENCE_DETAILS_ALL.find(
      (defence) => defence.id === id
    )?.name;
    const infoMessage = `${defenceInfo} defence triggered`;
    addDefenceTriggeredMessage(infoMessage.toLowerCase());
  };

  function addPhasePreambleMessage(message: string) {
    addChatMessage({
      message: message,
      type: CHAT_MESSAGE_TYPE.PHASE_INFO,
      isOriginalMessage: true,
    });
  }

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
