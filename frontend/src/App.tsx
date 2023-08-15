import { useState } from "react";
import { useEffect } from "react";
import "./App.css";
import AttackBox from "./components/AttackBox/AttackBox";
import ChatBox from "./components/ChatBox/ChatBox";
import DefenceBox from "./components/DefenceBox/DefenceBox";
import EmailBox from "./components/EmailBox/EmailBox";
import ApiKeyBox from "./components/ApiKeyBox/ApiKeyBox";
import PhaseSelectionBox from "./components/PhaseSelectionBox/PhaseSelectionBox";
import Header from "./components/Header";
import ModelSelectionBox from "./components/ModelSelectionBox/ModelSelectionBox";
import { EmailInfo } from "./models/email";
import { CHAT_MESSAGE_TYPE, ChatMessage } from "./models/chat";
import { DefenceInfo } from "./models/defence";
import { getCompletedPhases } from "./service/phaseService";
import { clearEmails } from "./service/emailService";
import { clearChat } from "./service/chatService";
import { PHASES } from "./Phases";

function App() {
  const [defenceBoxKey, setDefenceBoxKey] = useState<number>(0);
  const [emails, setEmails] = useState<EmailInfo[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [triggeredDefences, setTriggeredDefences] = useState<string[]>([]);

  // start on sandbox mode
  const [currentPhase, setCurrentPhase] = useState<number>(3);
  const [numCompletedPhases, setNumCompletedPhases] = useState<number>(0);

  const updateTriggeredDefences = (defenceDetails: string[]) => {
    // set the new triggered defences
    setTriggeredDefences(defenceDetails);
    // update the key of the defence box to force a re-render
    setDefenceBoxKey(defenceBoxKey + 1);
  };

  // methods to modify messages
  const addChatMessage = (message: ChatMessage) => {
    setMessages((messages: ChatMessage[]) => [...messages, message]);
  };
  const addInfoMessage = (message: string) => {
    addChatMessage({
      message: message,
      type: CHAT_MESSAGE_TYPE.INFO,
      isOriginalMessage: true,
    });
  };
  const addPhasePreambleMessage = (message: string) => {
    addChatMessage({
      message: message,
      type: CHAT_MESSAGE_TYPE.PHASE_INFO,
      isOriginalMessage: true,
    });
  };

  const clearMessages = () => {
    // resetting the current phase will also reset the messages
    setNewPhase(currentPhase);
  };

  const clearEmailBox = () => {
    setEmails([]);
    clearEmails();
  };

  const setNewPhase = (newPhase: number) => {
    // reset emails and messages from front and backend
    clearChat();
    clearEmailBox();
    // clear frontend messages
    setMessages([]);
    setCurrentPhase(newPhase);

    // add the preamble to the chat
    const preambleMessage = PHASES[newPhase].preamble;
    addPhasePreambleMessage(preambleMessage.toLowerCase());
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
        {/* hide defence box on phases 0 and 1 */}
        {currentPhase >= 2 && (
          <DefenceBox
            key={defenceBoxKey}
            triggeredDefences={triggeredDefences}
            defenceActivated={defenceActivated}
            defenceDeactivated={defenceDeactivated}
          />
        )}
        {/* hide attack box on phase 0 only */}
        {currentPhase !== 0 && <AttackBox />}
        {/* hide model selection box on phases 0 and 1 */}
        {currentPhase >= 2 && <ModelSelectionBox />}
      </div>
      <div id="centre-area">
        <Header />
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
        <PhaseSelectionBox
          currentPhase={currentPhase}
          numCompletedPhases={numCompletedPhases}
          setNewPhase={setNewPhase}
        />
        <EmailBox emails={emails} />
      </div>
    </span>
  );
}

export default App;
