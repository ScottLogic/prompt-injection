import { ChatMessage } from "../../models/chat";
import "./ChatBoxMessage.css";

function ChatBoxMessage({ message }: { message: ChatMessage }) {
  return (
    <div
      className={
        message.isUser
          ? message.isOriginalMessage
            ? "chat-box-message chat-box-message-user"
            : "chat-box-message chat-box-message-user-transformed"
          : message.defenceInfo?.blocked
          ? "chat-box-message chat-box-message-ai chat-box-message-blocked"
          : "chat-box-message chat-box-message-ai chat-box-message-ok"
      }
      lang="en"
    >
      {(message.isUser && message.isOriginalMessage && <b>Input: </b>) ||
        (message.isUser && !message.isOriginalMessage && <b>Edited: </b>)}
      {message.message}
    </div>
  );
}

export default ChatBoxMessage;
