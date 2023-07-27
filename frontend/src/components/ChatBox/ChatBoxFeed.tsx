import React from "react";
import { OpenAIMessage } from "../../service/openaiService";
import "./ChatBoxFeed.css";
import ChatBoxMessage from "./ChatBoxMessage";

function ChatBoxFeed({ messages }: { messages: OpenAIMessage[] }) {
  return (
    <div id="chat-box-feed">
      {[...messages].reverse().map((message, index) => {
        return <ChatBoxMessage key={index} message={message} />;
      })}
    </div>
  );
}

export default ChatBoxFeed;
