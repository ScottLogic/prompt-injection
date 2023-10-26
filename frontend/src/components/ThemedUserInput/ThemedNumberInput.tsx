import { KeyboardEvent } from "react";

import "./ThemedNumberInput.css";
import { clsx } from "clsx";

function ThemedNumberInput({
  // optional
  content,
  disabled,
  enterPressed,
  onBlur,
  setContent,
}: {
  // optional
  content?: string;
  disabled?: boolean;
  enterPressed?: () => void;
  onBlur?: () => void;
  setContent?: (text: string) => void;
}) {
  function inputChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (setContent) {
      setContent(event.target.value);
    }
  }

  function inputKeyUp(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" && enterPressed) {
      enterPressed();
    }
  }

  function onFocusLost() {
    if (onBlur) {
      onBlur();
    }
  }

  const inputClass = clsx("themed-number-input", {
    disabled: disabled,
  });

  return (
    <input
      className={inputClass}
      type="number"
      value={content}
      disabled={disabled}
      onBlur={onFocusLost}
      onChange={inputChange}
      onKeyUp={inputKeyUp}
    />
  );
}

export default ThemedNumberInput;
