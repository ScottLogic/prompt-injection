import "./ChatBox.css";
import ChatBoxFeed from "./ChatBoxFeed";

const messages = [
  { message: "hello", isUser: true },
  { message: "world", isUser: false },
  {
    message:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    isUser: true,
  },
  {
    message:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    isUser: false,
  },
  { message: "hello", isUser: true },
  { message: "world", isUser: false },
  { message: "hello", isUser: true },
  { message: "world", isUser: false },
];

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
