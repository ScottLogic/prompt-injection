import "./ChatBoxFeed.css";
import { CHAT_MESSAGE_TYPE, ChatMessage } from "../../models/chat";
import ChatBoxMessage from "./ChatBoxMessage";
import ChatBoxInfoText from "./ChatBoxInfoText";

function ChatBoxFeed({ messages }: { messages: ChatMessage[] }) {
  return (
    <div id="chat-box-feed">
      {[...messages].reverse().map((message, index) => {
        if (message.type === CHAT_MESSAGE_TYPE.INFO) {
          return <ChatBoxInfoText key={index} text={message.message} />;
        } else {
          return <ChatBoxMessage key={index} message={message} />;
        }
      })}
    </div>
  );
}

export default ChatBoxFeed;
