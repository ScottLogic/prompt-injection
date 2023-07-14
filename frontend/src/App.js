import "./App.css";
import ChatBox from "./components/ChatBox/ChatBox";
import DefenceBox from "./components/DefenceBox/DefenceBox";
import EmailBox from "./components/EmailBox/EmailBox";
import Header from "./components/Header";
import { useState } from "react";

function App() {
  const [emails, setEmails] = useState([]);

  return (
    <span id="main-area">
      <div class="side-bar">
        <div class="side-bar-header">defence mechanisms</div>
        <DefenceBox />
      </div>
      <div id="centre-area">
        <Header />
        <ChatBox setEmails={setEmails} />
      </div>
      <div class="side-bar">
        <div class="side-bar-header">sent emails</div>
        <EmailBox emails={emails} />
      </div>
    </span>
  );
}

export default App;
