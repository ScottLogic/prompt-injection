import "./ChatBoxFeed.css";
import { CHAT_MESSAGE_TYPE, ChatMessage } from "../../models/chat";
import ChatBoxMessage from "./ChatBoxMessage";
import ChatBoxInfoText from "./ChatBoxInfoText";
import { useRef } from "react";
import useIsOverflow from "../../hooks/useIsOverflow";

function ChatBoxFeed({ messages }: { messages: ChatMessage[] }) {
  const container = useRef<HTMLInputElement>(null);
  const isOverflow = useIsOverflow(container);

  return (
    <div
      className="chat-box-feed"
      ref={container}
      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
      tabIndex={isOverflow ? 0 : -1}
    >
      {[...messages].reverse().map((message, index) => {
        if (
          message.type === CHAT_MESSAGE_TYPE.INFO ||
          message.type === CHAT_MESSAGE_TYPE.DEFENCE_ALERTED ||
          message.type === CHAT_MESSAGE_TYPE.DEFENCE_TRIGGERED
        ) {
          return (
            <ChatBoxInfoText
              key={index}
              text={message.message}
              type={message.type}
            />
          );
        } else {
          return <ChatBoxMessage key={index} message={message} />;
        }
      })}
    </div>
  );
}

export default ChatBoxFeed;
