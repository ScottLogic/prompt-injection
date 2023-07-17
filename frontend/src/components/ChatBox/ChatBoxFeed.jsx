import "./ChatBoxFeed.css";
import ChatBoxMessage from "./ChatBoxMessage";

function ChatBoxFeed(props) {
  return (
    <div id="chat-box-feed">
      {props.messages.toReversed().map((message, index) => {
        return (
          <ChatBoxMessage
            key={index}
            defenceInfo={message.defenceInfo}
            isUser={message.isUser}
            message={message.message}
            isOriginalMessage={message.isOriginalMessage}
          />
        );
      })}
    </div>
  );
}

export default ChatBoxFeed;
