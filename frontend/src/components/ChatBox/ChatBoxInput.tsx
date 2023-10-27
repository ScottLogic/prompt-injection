import ThemedTextArea from "../ThemedInput/ThemedTextArea";
import { KeyboardEvent } from "react";

function ChatBoxInput({
  content,
  recallSentMessageFromHistory,
  sendChatMessage,
  setContent,
}: {
  content: string;
  recallSentMessageFromHistory: (direction: "backward" | "forward") => void;
  sendChatMessage: () => void;
  setContent: (text: string) => void;
}) {
  function inputKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    const ctrlUp = event.ctrlKey && event.key === "ArrowUp";
    const ctrlDown = event.ctrlKey && event.key === "ArrowDown";
    const enterNotShift = event.key === "Enter" && !event.shiftKey;

    if (ctrlUp || ctrlDown || enterNotShift) {
      event.preventDefault();
    }
  }

  function inputKeyUp(event: KeyboardEvent<HTMLTextAreaElement>) {
    // shift+enter shouldn't send message
    if (event.key === "Enter" && !event.shiftKey) {
      // asynchronously send the message
      sendChatMessage();
    } else if (event.key === "ArrowUp" && event.ctrlKey) {
      recallSentMessageFromHistory("backward");
    } else if (event.key === "ArrowDown" && event.ctrlKey) {
      recallSentMessageFromHistory("forward");
    }
  }

  return (
    <ThemedTextArea
      placeHolderText="Type here..."
      content={content}
      setContent={setContent}
      spacing="loose"
      maxLines={10}
      onKeyDown={inputKeyDown}
      onKeyUp={inputKeyUp}
      // eslint-disable-next-line jsx-a11y/no-autofocus
      autoFocus={true}
    />
  );
}

export default ChatBoxInput;
