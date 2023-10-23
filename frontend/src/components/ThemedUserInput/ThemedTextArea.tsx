import { KeyboardEvent, useEffect, useRef } from "react";

import "./ThemedTextArea.css";

function ThemedTextArea({
  // optional
  autoFocus,
  content,
  placeHolderText,
  enterPressed,
  setContent,
}: {
  // optional
  autoFocus?: boolean;
  content?: string;
  placeHolderText?: string;
  enterPressed?: (text: string) => void;
  setContent?: (text: string) => void;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // set the content of the textarea when it changes
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.value = content ?? "";
      resizeInput();
    }
  }, [content]);

  function resizeInput() {
    if (textareaRef.current) {
      const maxHeightPx = 150;
      textareaRef.current.style.height = "0";
      if (textareaRef.current.scrollHeight > maxHeightPx) {
        textareaRef.current.style.height = `${maxHeightPx}px`;
        textareaRef.current.style.overflowY = "auto";
      } else {
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        textareaRef.current.style.overflowY = "hidden";
      }
    }
  }

  function inputChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
    if (setContent) {
      const text = event.target.value;
      setContent(text);
    }

    if (textareaRef.current) {
      // scroll to the bottom
      textareaRef.current.scrollTop =
        textareaRef.current.scrollHeight - textareaRef.current.clientHeight;
      // reset the height
      resizeInput();
    }
  }

  function inputKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
    }
  }

  function inputKeyUp(event: KeyboardEvent<HTMLTextAreaElement>) {
    // shift+enter shouldn't trigger enterPressed
    if (event.key === "Enter" && !event.shiftKey && enterPressed) {
      const message = textareaRef.current?.value ?? "";
      enterPressed(message);
    }
  }

  return (
    <textarea
      ref={textareaRef}
      className="themed-text-area"
      placeholder={placeHolderText}
      defaultValue={content}
      rows={1}
      onChange={inputChange}
      onKeyDown={inputKeyDown}
      onKeyUp={inputKeyUp}
      // eslint-disable-next-line jsx-a11y/no-autofocus
      autoFocus={autoFocus}
    />
  );
}

export default ThemedTextArea;
