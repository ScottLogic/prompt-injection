import ThemedTextArea from "../ThemedInput/ThemedTextArea";
import { KeyboardEvent } from "react";

function ChatBoxInput({
  content,
  onContentChanged,
  recallSentMessageFromHistory,
  sendChatMessage,
}: {
  content: string;
  onContentChanged: (newContent: string) => void;
  recallSentMessageFromHistory: (direction: "backward" | "forward") => void;
  sendChatMessage: () => void;
}) {
  function isCtrlUp(event: KeyboardEvent<HTMLTextAreaElement>) {
    return event.ctrlKey && event.key === "ArrowUp";
  }

  function isCtrlDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    return event.ctrlKey && event.key === "ArrowDown";
  }

  function isEnterNotShift(event: KeyboardEvent<HTMLTextAreaElement>) {
    return event.key === "Enter" && !event.shiftKey;
  }

  function inputKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (isCtrlUp(event) || isCtrlDown(event) || isEnterNotShift(event)) {
      event.preventDefault();
    }
  }

  function inputKeyUp(event: KeyboardEvent<HTMLTextAreaElement>) {
    // shift+enter shouldn't send message
    if (isEnterNotShift(event)) {
      sendChatMessage();
    } else if (isCtrlDown(event)) {
      recallSentMessageFromHistory("backward");
    } else if (isCtrlUp(event)) {
      recallSentMessageFromHistory("forward");
    }
  }

  return (
    <ThemedTextArea
      content={content}
      onContentChanged={onContentChanged}
      placeHolderText="Type here..."
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
