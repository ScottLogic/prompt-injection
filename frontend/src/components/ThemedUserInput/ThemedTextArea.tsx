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
  onBlur,
  onKeyDown,
  onKeyUp,
  setContent,
}: {
  // optional
  autoFocus?: boolean;
  content?: string;
  disabled?: boolean;
  maxLines?: number;
  placeHolderText?: string;
  spacing?: "loose" | "tight";
  onKeyDown?: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
  onKeyUp?: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
  onBlur?: () => void;
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
      return Math.floor(textHeight / lineHeight);
    } else {
      // by default, return one line
      return 1;
    }
  }

  function getMaxHeightPx() {
    // max height is maxLines * lineHeight + vertical padding
    if (textareaRef.current && maxLines) {
      const computedStyle = getComputedStyle(textareaRef.current);
      const padding =
        parseFloat(computedStyle.paddingTop) +
        parseFloat(computedStyle.paddingBottom);
      const lineHeight = parseFloat(computedStyle.lineHeight);
      return maxLines * lineHeight + padding;
    } else {
      // by default, return 20px
      return 20;
    }
  }

  // expand textbox height up to maxLines
  function resizeInput() {
    if (textareaRef.current) {
      // modified from https://www.cryer.co.uk/resources/javascript/script21_auto_grow_text_box.htm#gsc.tab=0
      // set to 0 height first to shrink the textarea if needed
      textareaRef.current.style.height = "0";
      if (textareaRef.current.clientHeight < textareaRef.current.scrollHeight) {
        const numLines = getNumLines();
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
      setContent(event.target.value);
    }

    if (textareaRef.current) {
      // scroll to the bottom
      textareaRef.current.scrollTop =
        textareaRef.current.scrollHeight - textareaRef.current.clientHeight;
      // reset the height
      resizeInput();
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
      onBlur={onBlur}
      onChange={inputChange}
      onKeyDown={onKeyDown}
      onKeyUp={onKeyUp}
      disabled={disabled}
      // eslint-disable-next-line jsx-a11y/no-autofocus
      autoFocus={autoFocus}
    />
  );
}

export default ThemedTextArea;
