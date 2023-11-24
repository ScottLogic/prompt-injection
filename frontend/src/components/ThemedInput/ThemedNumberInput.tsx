import { clsx } from "clsx";
import { KeyboardEvent } from "react";

import "./ThemedInput.css";
import "./ThemedNumberInput.css";

function ThemedNumberInput({
  // required
  content,
  onContentChanged,
  id,
  // optional
  disabled = false,
  enterPressed,
  onBlur,
}: {
  // required
  content: string;
  onContentChanged: (newContent: string) => void;
  id: string;
  // optional
  disabled?: boolean;
  enterPressed?: () => void;
  onBlur?: () => void;
}) {
  function inputChanged(event: React.ChangeEvent<HTMLInputElement>) {
    onContentChanged(event.target.value);
  }

  function inputKeyUp(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      enterPressed?.();
    }
  }

  const inputClass = clsx("themed-input", "themed-number-input", {
    disabled,
  });

  return (
    <input
      id={id}
      className={inputClass}
      type="number"
      value={content}
      disabled={disabled}
      onBlur={onBlur}
      onChange={inputChanged}
      onKeyUp={inputKeyUp}
    />
  );
}

export default ThemedNumberInput;
