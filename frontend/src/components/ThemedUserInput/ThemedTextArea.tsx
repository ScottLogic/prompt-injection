import { KeyboardEvent, useEffect, useRef } from "react";

import "./ThemedTextArea.css";
import { clsx } from "clsx";

function ThemedTextArea({
  // optional
  autoFocus,
  content,
  disabled,
  maxLines,
  placeHolderText,
  spacing,
  enterPressed,
  setContent,
}: {
  // optional
  autoFocus?: boolean;
  content?: string;
  disabled?: boolean;
  maxLines?: number;
  placeHolderText?: string;
  spacing?: "loose" | "tight";
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

  function getNumLines() {
    if (textareaRef.current) {
      const computedStyle = getComputedStyle(textareaRef.current);
      // height of text is scrollHeight - vertical padding
      const padding =
        parseFloat(computedStyle.paddingTop) +
        parseFloat(computedStyle.paddingBottom);
      const textHeight = textareaRef.current.scrollHeight - padding;
      const lineHeight = parseFloat(computedStyle.lineHeight);
      const numLines = Math.floor(textHeight / lineHeight);
      return numLines;
    } else {
      // by default, return one line
      return 1;
    }
  }

  function getMaxHeightPx() {
    // max height is maxLines * lineHeight + vertical padding
    if (textareaRef.current) {
      const computedStyle = getComputedStyle(textareaRef.current);
      const padding =
        parseFloat(computedStyle.paddingTop) +
        parseFloat(computedStyle.paddingBottom);
      const lineHeight = parseFloat(computedStyle.lineHeight);
      const maxHeight = maxLines ? maxLines * lineHeight + padding : 0;
      return maxHeight;
    } else {
      // by default, return 0
      return 0;
    }
  }

  // expand textbox height up to maxHeightRem
  function resizeInput() {
    if (textareaRef.current) {
      const numLines = getNumLines();
      // modified from https://www.cryer.co.uk/resources/javascript/script21_auto_grow_text_box.htm#gsc.tab=0
      // set to 0 height first to shrink the textarea if needed
      textareaRef.current.style.height = "0";
      if (textareaRef.current.clientHeight < textareaRef.current.scrollHeight) {
        if (maxLines && numLines > maxLines) {
          // max height reached, stop expanding and start scrolling
          textareaRef.current.style.height = `${getMaxHeightPx()}px`;
          textareaRef.current.style.overflow = "auto";
        } else {
          // expand the textarea
          // need to set the height to the scroll height first
          textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
          textareaRef.current.style.height = `${
            textareaRef.current.scrollHeight * 2 -
            textareaRef.current.clientHeight
          }px`;
          // don't show scrollbars
          textareaRef.current.style.overflow = "hidden";
        }
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
    // only add new line when enter AND shift are pressed
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

  const textAreaClass = clsx("themed-text-area", {
    disabled: disabled,
    "spacing-loose": spacing === "loose",
  });

  return (
    <textarea
      ref={textareaRef}
      className={textAreaClass}
      placeholder={placeHolderText}
      defaultValue={content}
      rows={1}
      onChange={inputChange}
      onKeyDown={inputKeyDown}
      onKeyUp={inputKeyUp}
      disabled={disabled}
      // eslint-disable-next-line jsx-a11y/no-autofocus
      autoFocus={autoFocus}
    />
  );
}

export default ThemedTextArea;
