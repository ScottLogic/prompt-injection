import { KeyboardEvent, useEffect, useState } from "react";

import ThemedNumberInput from "@src/components/ThemedInput/ThemedNumberInput";
import ThemedTextArea from "@src/components/ThemedInput/ThemedTextArea";

function DefenceConfigurationInput({
  currentValue,
  disabled,
  inputType,
  setConfigurationValue,
}: {
  currentValue: string;
  disabled: boolean;
  inputType: "text" | "number";
  setConfigurationValue: (value: string) => void;
}) {
  const CONFIG_VALUE_CHARACTER_LIMIT = 5000;
  const [value, setValue] = useState<string>(currentValue);

  // update the text area value when reset/changed
  useEffect(() => {
    setValue(currentValue);
  }, [currentValue]);

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
        onContentChanged={setValue}
        disabled={disabled}
        maxLines={10}
        onBlur={() => {
          setConfigurationValue(value);
        }}
        onKeyDown={inputKeyDown}
        onKeyUp={inputKeyUp}
        characterLimit={CONFIG_VALUE_CHARACTER_LIMIT}
      />
    );
  } else {
    return (
      <ThemedNumberInput
        content={value}
        onContentChanged={setValue}
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
