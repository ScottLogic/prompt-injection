import React, { useEffect, useState } from "react";

import "./ChatBox.css";
import ChatBoxFeed from "./ChatBoxFeed";
import { clearOpenAiChat, openAiSendMessage } from "../service/openai";

function ChatBox() {
  const [messages, setMessages] = useState([]);

  // called on mount
  useEffect(() => {
    // clear remote messages
    clearOpenAiChat();
  }, []);

  const clearClicked = () => {
    // clear local messages
    setMessages([]);
    // clear remote messages
    clearOpenAiChat();
  };

  const sendChatMessage = async (event) => {
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

      const reply = await openAiSendMessage(message);
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
      <div id="chat-box-footer">
        <div id="chat-box-input">
          <input
            type="text"
            placeholder="Chat to ChatGPT..."
            autoFocus
            onKeyUp={sendChatMessage.bind(this)}
          />
        </div>
        <div id="chat-box-button" onClick={clearClicked.bind(this)}>
          <button>clear</button>
        </div>
      </div>
    </div>
  );
}

export default ChatBox;
