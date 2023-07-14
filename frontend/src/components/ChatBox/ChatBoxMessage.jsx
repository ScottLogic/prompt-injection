import "./ChatBoxMessage.css";

function ChatBoxMessage(props) {
  return (
    <div
      className={
        props.isUser
          ? "chat-box-message chat-box-message-user"
          : props.defenceInfo.blocked
          ? "chat-box-message chat-box-message-ai chat-box-message-blocked"
          : "chat-box-message chat-box-message-ai chat-box-message-ok"
      }
    >
      {props.message}
    </div>
  );
}

export default ChatBoxMessage;
