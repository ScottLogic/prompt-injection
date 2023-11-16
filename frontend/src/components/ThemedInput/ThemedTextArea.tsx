import { clsx } from "clsx";
import { KeyboardEvent, useEffect, useRef } from "react";

import "./ThemedInput.css";
import "./ThemedTextArea.css";

import useIsOverflow from "@src/hooks/useIsOverflow";

function getNumLines(textarea: HTMLTextAreaElement) {
  const computedStyle = getComputedStyle(textarea);
  // height of text is scrollHeight - vertical padding
  const padding =
    parseFloat(computedStyle.paddingTop) +
    parseFloat(computedStyle.paddingBottom);
  const textHeight = textarea.scrollHeight - padding;
  const lineHeight = parseFloat(computedStyle.lineHeight);
  return Math.floor(textHeight / lineHeight);
}

function getMaxHeightPx(textarea: HTMLTextAreaElement, maxLines: number) {
  // max height is maxLines * lineHeight + vertical padding
  const computedStyle = getComputedStyle(textarea);
  const padding =
    parseFloat(computedStyle.paddingTop) +
    parseFloat(computedStyle.paddingBottom);
  const lineHeight = parseFloat(computedStyle.lineHeight);
  return maxLines * lineHeight + padding;
}

// expand textbox height up to maxLines
function resizeInput(textarea: HTMLTextAreaElement, maxLines: number) {
  // modified from https://www.cryer.co.uk/resources/javascript/script21_auto_grow_text_box.htm#gsc.tab=0
  // set to 0 height first to shrink the textarea if needed
  textarea.style.height = "0";
  if (textarea.clientHeight < textarea.scrollHeight) {
    if (getNumLines(textarea) > maxLines) {
      // max height reached, stop expanding and start scrolling
      textarea.style.height = `${getMaxHeightPx(textarea, maxLines)}px`;
      // show the scrollbar
      textarea.style.overflow = "auto";
    } else {
      // expand the textarea
      // need to set the height to the scroll height
      // plus the difference between the offset height and the client height
      textarea.style.height = `${
        textarea.scrollHeight + textarea.offsetHeight - textarea.clientHeight
      }px`;
      // don't show the scrollbar
      textarea.style.overflow = "hidden";
    }
  }
}

function ThemedTextArea({
  // required
  content,
  onContentChanged,
  // optional
  autoFocus = false,
  disabled = false,
  maxLines = 1,
  spacing = "tight",
  placeHolderText,
  onBlur,
  onKeyDown,
  onKeyUp,
  characterLimit,
}: {
  // required
  content: string;
  onContentChanged: (newContent: string) => void;
  // optional
  autoFocus?: boolean;
  disabled?: boolean;
  maxLines?: number;
  spacing?: "loose" | "tight";
  placeHolderText?: string;
  onKeyDown?: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
  onKeyUp?: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
  onBlur?: () => void;
  characterLimit?: number;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      resizeInput(textareaRef.current, maxLines);
    }
  }, [content]);

  function inputChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
    onContentChanged(event.target.value);
  }

  const textAreaClass = clsx("themed-input", "themed-text-area", spacing, {
    disabled,
  });

  // allow scrolling even when disabled
  const isOverflow = useIsOverflow(textareaRef);

  return (
    <textarea
      ref={textareaRef}
      className={textAreaClass}
      placeholder={placeHolderText}
      value={content}
      rows={1}
      onBlur={onBlur}
      onChange={inputChange}
      onKeyDown={onKeyDown}
      onKeyUp={onKeyUp}
      readOnly={disabled}
      // eslint-disable-next-line jsx-a11y/no-autofocus
      autoFocus={autoFocus}
      maxLength={characterLimit}
      tabIndex={isOverflow ? 0 : undefined}
    />
  );
}

export default ThemedTextArea;
