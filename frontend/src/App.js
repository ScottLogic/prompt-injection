import "./App.css";
import ChatBox from "./components/ChatBox/ChatBox";
import DefenceBox from "./components/DefenceBox/DefenceBox";
import EmailBox from "./components/EmailBox/EmailBox";
import Header from "./components/Header";
import { useState } from "react";

function App() {
  const [defenceBoxKey, setDefenceBoxKey] = useState(0);
  const [emails, setEmails] = useState([]);
  const [triggeredDefences, setTriggeredDefences] = useState([]);

  const updateTriggeredDefences = (defences) => {
    // set the new triggered defences
    setTriggeredDefences(defences);
    // update the key of the defence box to force a re-render
    setDefenceBoxKey(defenceBoxKey + 1);
  };

  return (
    <span id="main-area">
      <div className="side-bar">
        <div className="side-bar-header">defence mechanisms</div>
        <DefenceBox key={defenceBoxKey} triggeredDefences={triggeredDefences} />
        <div className="side-bar-header">attack tactics</div>
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
