import "./ChatBoxMessage.css";

function ChatBoxMessage(props) {
  return (
    <div
      className={
        props.isUser && props.isOriginalMessage
          ? "chat-box-message chat-box-message-user" :
          props.isUser && !props.isOriginalMessage
          ? "chat-box-message chat-box-message-user-transformed" :
           
          props.defenceInfo.blocked
            ? "chat-box-message chat-box-message-ai chat-box-message-blocked"
            : "chat-box-message chat-box-message-ai chat-box-message-ok"
      }
    >
      {props.isUser && props.isOriginalMessage && (
        <b>Input: </b>
      ) || props.isUser && !props.isOriginalMessage && (
      <b>Edited: </b>)
      }
      {props.message}
    </div>
  );
}

export default ChatBoxMessage;
