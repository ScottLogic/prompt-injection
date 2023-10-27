import { KeyboardEvent } from "react";

import "./ThemedInput.css";
import { clsx } from "clsx";

function ThemedNumberInput({
  // required
  content,
  setContent,
  // optional
  disabled,
  enterPressed,
  onBlur,
}: {
  // required
  content: string;
  setContent: (text: string) => void;
  // optional
  disabled?: boolean;
  enterPressed?: () => void;
  onBlur?: () => void;
}) {
  function inputChange(event: React.ChangeEvent<HTMLInputElement>) {
    setContent(event.target.value);
  }

  function inputKeyUp(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" && enterPressed) {
      enterPressed();
    }
  }

  const inputClass = clsx("themed-input", {
    disabled: disabled,
  });

  return (
    <input
      className={inputClass}
      type="number"
      value={content}
      disabled={disabled}
      onBlur={onBlur}
      onChange={inputChange}
      onKeyUp={inputKeyUp}
    />
  );
}

export default ThemedNumberInput;
