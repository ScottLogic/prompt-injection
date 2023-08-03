import "./ChatBoxFeed.css";
import { ChatMessage } from "../../models/chat";
import ChatBoxMessage from "./ChatBoxMessage";

function ChatBoxFeed({ messages }: { messages: ChatMessage[] }) {
  return (
    <div id="chat-box-feed">
      {[...messages].reverse().map((message, index) => {
        return <ChatBoxMessage key={index} message={message} />;
      })}
    </div>
  );
}

export default ChatBoxFeed;
