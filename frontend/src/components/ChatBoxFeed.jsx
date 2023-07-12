import "./ChatBoxFeed.css";
import ChatBoxMessage from "./ChatBoxMessage";

function ChatBoxFeed(props) {
  return (
    <div id="chat-box-feed">
      {props.messages.map((message, index) => {
        return (
          <ChatBoxMessage message={message.message} isUser={message.isUser} />
        );
      })}
    </div>
  );
}

export default ChatBoxFeed;
