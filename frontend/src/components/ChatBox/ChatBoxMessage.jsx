import "./ChatBoxMessage.css";

function ChatBoxMessage(props) {
  if (props.isUser) {
    return (
      <div className="chat-box-message chat-box-message-user">
        {props.message}
      </div>
    );
  } else {
    return (
      <div className="chat-box-message chat-box-message-ai">
        {props.message}
      </div>
    );
  }
}

export default ChatBoxMessage;
