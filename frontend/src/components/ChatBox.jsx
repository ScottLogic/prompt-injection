import "./ChatBox.css";

const messages = [];

function ChatBox() {
  return (
    <div id="chat-box">
      <input type="text" placeholder="Chat to ChatGPT..." />
    </div>
  );
}

export default ChatBox;
