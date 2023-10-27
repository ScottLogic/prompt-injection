import ThemedTextArea from "../ThemedInput/ThemedTextArea";
import ThemedNumberInput from "../ThemedInput/ThemedNumberInput";
import { KeyboardEvent, useState } from "react";

function DefenceConfigurationInput({
  defaultValue,
  disabled,
  inputType,
  setConfigurationValue,
}: {
  defaultValue: string;
  disabled: boolean;
  inputType: "text" | "number";
  setConfigurationValue: (value: string) => void;
}) {
  const [value, setValue] = useState<string>(defaultValue);

  function inputKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
    }
  }

  function inputKeyUp(event: KeyboardEvent<HTMLTextAreaElement>) {
    // shift+enter shouldn't send message
    if (event.key === "Enter" && !event.shiftKey) {
      // asynchronously send the message
      setConfigurationValue(value);
    }
  }

  if (inputType === "text") {
    return (
      <ThemedTextArea
        content={value}
        setContent={setValue}
        disabled={disabled}
        maxLines={10}
        onBlur={() => {
          setConfigurationValue(value);
        }}
        onKeyDown={inputKeyDown}
        onKeyUp={inputKeyUp}
      />
    );
  } else {
    return (
      <ThemedNumberInput
        content={value}
        setContent={setValue}
        disabled={disabled}
        enterPressed={() => {
          setConfigurationValue(value);
        }}
        onBlur={() => {
          setConfigurationValue(value);
        }}
      />
    );
  }
}

export default DefenceConfigurationInput;
