import { CHAT_MESSAGE_TYPE, ChatMessage } from "../../models/chat";
import "./ChatBoxMessage.css";

function ChatBoxMessage({ message }: { message: ChatMessage }) {
  function getMessage() {
    if (
      message.type === CHAT_MESSAGE_TYPE.BOT &&
      message.defenceInfo?.isBlocked
    ) {
      // show the reason why the message was blocked
      return message.defenceInfo.blockedReason;
    } else {
      return message.message;
    }
  }

  return (
    <div
      className={
        message.type === CHAT_MESSAGE_TYPE.PHASE_INFO
          ? "chat-box-message chat-box-message-phase-info"
          : message.type === CHAT_MESSAGE_TYPE.USER
          ? message.isOriginalMessage
            ? "chat-box-message chat-box-message-user"
            : "chat-box-message chat-box-message-user-transformed"
          : message.defenceInfo?.isBlocked
          ? "chat-box-message chat-box-message-ai chat-box-message-blocked"
          : "chat-box-message chat-box-message-ai chat-box-message-ok"
      }
      lang="en"
    >
      {(message.type === CHAT_MESSAGE_TYPE.USER &&
        message.isOriginalMessage && <b>Input: </b>) ||
        (message.type === CHAT_MESSAGE_TYPE.USER &&
          !message.isOriginalMessage && <b>Edited: </b>)}
      {getMessage()}
    </div>
  );
}

export default ChatBoxMessage;
