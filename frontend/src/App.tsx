import React from "react";
import "./App.css";
import ChatBox from "./components/ChatBox/ChatBox";
import DefenceBox from "./components/DefenceBox/DefenceBox";
import EmailBox from "./components/EmailBox/EmailBox";
import Header from "./components/Header";
import ModelSelectionBox from "./components/ModelSelectionBox/ModelSelectionBox";
import { useState } from "react";
import { EmailInfo } from "./models/email";

function App() {
  const [defenceBoxKey, setDefenceBoxKey] = useState<number>(0);
  const [emails, setEmails] = useState<EmailInfo[]>([]);
  const [triggeredDefences, setTriggeredDefences] = useState<string[]>([]);

  const updateTriggeredDefences = (defenceDetails: string[]) => {
    // set the new triggered defences
    setTriggeredDefences(defenceDetails);
    // update the key of the defence box to force a re-render
    setDefenceBoxKey(defenceBoxKey + 1);
  };

  return (
    <span id="main-area">
      <div className="side-bar">
        <div className="side-bar-header">defence mechanisms</div>
        <DefenceBox key={defenceBoxKey} triggeredDefences={triggeredDefences} />

        <div className="side-bar-header">model selection</div>
        <ModelSelectionBox />
      </div>
      <div id="centre-area">
        <Header />
        <ChatBox
          setEmails={setEmails}
          updateTriggeredDefences={updateTriggeredDefences}
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
