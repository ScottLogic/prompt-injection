import { CHAT_MESSAGE_TYPE, ChatMessage } from "../../models/chat";
import "./ChatBoxMessage.css";

function ChatBoxMessage({ message }: { message: ChatMessage }) {
  return (
    <div
      className={
        message.type === CHAT_MESSAGE_TYPE.PHASE_INFO
          ? "chat-box-message chat-box-message-phase-info"
          : message.type === CHAT_MESSAGE_TYPE.USER
          ? "chat-box-message chat-box-message-user"
          : message.type === CHAT_MESSAGE_TYPE.USER_TRANSFORMED
          ? "chat-box-message chat-box-message-user chat-box-message-user-transformed"
          : message.type === CHAT_MESSAGE_TYPE.BOT
          ? "chat-box-message chat-box-message-ai"
          : "chat-box-message chat-box-message-ai chat-box-message-ai-blocked"
      }
      lang="en"
    >
      {(message.type === CHAT_MESSAGE_TYPE.USER && <b>Input: </b>) ||
        (message.type === CHAT_MESSAGE_TYPE.USER_TRANSFORMED && (
          <b>Edited: </b>
        ))}
      {message.type === CHAT_MESSAGE_TYPE.PHASE_INFO && (
        <p className="phase-info-header">Information</p>
      )}
      {message.message}
    </div>
  );
}

export default ChatBoxMessage;
