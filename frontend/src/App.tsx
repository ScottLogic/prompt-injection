import { useState } from "react";

import "./App.css";
import AttackBox from "./components/AttackBox/AttackBox";
import ChatBox from "./components/ChatBox/ChatBox";
import DefenceBox from "./components/DefenceBox/DefenceBox";
import EmailBox from "./components/EmailBox/EmailBox";
import ApiKeyBox from "./components/ApiKeyBox/ApiKeyBox";
import Header from "./components/Header";
import ModelSelectionBox from "./components/ModelSelectionBox/ModelSelectionBox";
import { EmailInfo } from "./models/email";
import { CHAT_MESSAGE_TYPE, ChatMessage } from "./models/chat";
import { DefenceInfo } from "./models/defence";

function App() {
  const [defenceBoxKey, setDefenceBoxKey] = useState<number>(0);
  const [emails, setEmails] = useState<EmailInfo[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [triggeredDefences, setTriggeredDefences] = useState<string[]>([]);

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
  const clearMessages = () => {
    setMessages([]);
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
        <div className="side-bar-header">defence mechanisms</div>
        <DefenceBox
          key={defenceBoxKey}
          triggeredDefences={triggeredDefences}
          defenceActivated={defenceActivated}
          defenceDeactivated={defenceDeactivated}
        />

        <div className="side-bar-header">attack mechanisms</div>
        <AttackBox />
        <div className="side-bar-header">openai api key</div>
        <ApiKeyBox />
        <div className="side-bar-header">model selection</div>
        <ModelSelectionBox />
      </div>
      <div id="centre-area">
        <Header />
        <ChatBox
          messages={messages}
          setEmails={setEmails}
          updateTriggeredDefences={updateTriggeredDefences}
          addChatMessage={addChatMessage}
          clearMessages={clearMessages}
        />
      </div>
      <div className="side-bar">
        <div className="side-bar-header">sent emails</div>
        <EmailBox emails={emails} />
      </div>
    </span>
  );
}

export default App;
