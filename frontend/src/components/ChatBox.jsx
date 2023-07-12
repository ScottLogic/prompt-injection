import "./ChatBox.css";
import ChatBoxFeed from "./ChatBoxFeed";

const messages = ["hello", "world"];

function ChatBox() {
  return (
    <div id="chat-box">
      <ChatBoxFeed messages={messages} />
      <div id="chat-box-input">
        <input type="text" placeholder="Chat to ChatGPT..." />
      </div>
    </div>
  );
}

export default ChatBox;
