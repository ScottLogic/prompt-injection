import "./ChatBoxFeed.css";
import { CHAT_MESSAGE_TYPE, ChatMessage } from "../../models/chat";
import ChatBoxMessage from "./ChatBoxMessage";
import ChatBoxInfoText from "./ChatBoxInfoText";

function ChatBoxFeed({ messages }: { messages: ChatMessage[] }) {
  return (
    <div className="chat-box-feed">
      {[...messages].reverse().map((message, index) => {
        if (
          message.type === CHAT_MESSAGE_TYPE.INFO ||
          message.type === CHAT_MESSAGE_TYPE.DEFENCE_ALERTED ||
          message.type === CHAT_MESSAGE_TYPE.DEFENCE_TRIGGERED
        ) {
          return (
            <ChatBoxInfoText
              key={index}
              text={message.message}
              type={message.type}
            />
          );
        } else {
          return <ChatBoxMessage key={index} message={message} />;
        }
      })}
    </div>
  );
}

export default ChatBoxFeed;
