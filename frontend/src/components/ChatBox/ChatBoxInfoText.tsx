import { CHAT_MESSAGE_TYPE } from "../../models/chat";
import { FaTimes } from "react-icons/fa";
import "./ChatBoxInfoText.css";

function ChatBoxInfoText({
  text,
  type,
}: {
  text: string;
  type: CHAT_MESSAGE_TYPE;
}) {
  return (
    <div
      className={
        type === CHAT_MESSAGE_TYPE.DEFENCE_TRIGGERED
          ? "chat-box-info-defence-triggered-text"
          : "chat-box-info-text"
      }
    >
      {<FaTimes />} {text}
    </div>
  );
}

export default ChatBoxInfoText;
