import "./ChatBoxFeed.css";
import ChatBoxMessage from "./ChatBoxMessage";

function ChatBoxFeed(props) {
  return (
    <div id="chat-box-feed">
      {props.messages.toReversed().map((message, index) => {
        return (
          <ChatBoxMessage
            message={message.message}
            isUser={message.isUser}
            key={index}
          />
        );
      })}
    </div>
  );
}

export default ChatBoxFeed;
