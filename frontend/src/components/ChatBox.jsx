import React, { useState } from "react";

import "./ChatBox.css";
import ChatBoxFeed from "./ChatBoxFeed";

function ChatBox() {
  const [messages, setMessages] = useState([]);

  const onKeyUpValue = (event) => {
    if (event.key === "Enter") {
      // get the message
      const message = event.target.value;
      // add it to the list of messages
      setMessages((messages) => [...messages, { message, isUser: true }]);
      // clear the input
      event.target.value = "";

      // send the message to the backend
      fetch("http://localhost:3001/openai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      }).then((response) => {
        // get the response message
        response.text().then((data) => {
          // add it to the list of messages
          setMessages((messages) => [
            ...messages,
            { message: data, isUser: false },
          ]);
        });
      });
    }
  };

  return (
    <div id="chat-box">
      <ChatBoxFeed messages={messages} key={messages.length} />
      <div id="chat-box-input">
        <input
          type="text"
          placeholder="Chat to ChatGPT..."
          autoFocus
          onKeyUp={onKeyUpValue.bind(this)}
        />
      </div>
    </div>
  );
}

export default ChatBox;
