import React, { useState } from "react";

import "./ChatBox.css";
import ChatBoxFeed from "./ChatBoxFeed";
import { openAiChat } from "../service/openai";

function ChatBox() {
  const [messages, setMessages] = useState([]);

  const onKeyUpValue = async (event) => {
    if (event.key === "Enter") {
      // get the message
      const message = event.target.value;
      // add it to the list of messages
      setMessages((messages) => [
        ...messages,
        { message: message, isUser: true },
      ]);
      // clear the input
      event.target.value = "";

      const reply = await openAiChat(message);
      // add it to the list of messages
      setMessages((messages) => [
        ...messages,
        { message: reply, isUser: false },
      ]);
    }
  };

  return (
    <div id="chat-box">
      <ChatBoxFeed messages={messages} />
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
