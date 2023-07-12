import "./ChatBoxFeed.css";

function ChatBoxFeed(props) {
  return (
    <div id="chat-box-feed">
      {props.messages.map((message, index) => {
        return <div>{message}</div>;
      })}
    </div>
  );
}

export default ChatBoxFeed;
