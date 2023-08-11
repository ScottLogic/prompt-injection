import { CHAT_MESSAGE_TYPE, ChatMessage } from "../../models/chat";
import "./ChatBoxMessage.css";

function ChatBoxMessage({ message }: { message: ChatMessage }) {
  return (
    <div
      className={
        message.type === CHAT_MESSAGE_TYPE.USER
          ? message.isOriginalMessage
            ? "chat-box-message chat-box-message-user"
            : "chat-box-message chat-box-message-user-transformed"
          : message.defenceInfo?.blocked
          ? "chat-box-message chat-box-message-ai chat-box-message-blocked"
          : "chat-box-message chat-box-message-ai chat-box-message-ok"
      }
      lang="en"
    >
      {(message.type === CHAT_MESSAGE_TYPE.USER &&
        message.isOriginalMessage && <b>Input: </b>) ||
        (message.type === CHAT_MESSAGE_TYPE.USER &&
          !message.isOriginalMessage && <b>Edited: </b>)}
      {message.message}
    </div>
  );
}

export default ChatBoxMessage;
