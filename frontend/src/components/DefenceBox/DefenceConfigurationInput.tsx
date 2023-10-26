import ThemedTextArea from "../ThemedUserInput/ThemedTextArea";
import ThemedNumberInput from "../ThemedUserInput/ThemedNumberInput";
import { useState } from "react";

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

  if (inputType === "text") {
    return (
      <ThemedTextArea
        content={value}
        setContent={setValue}
        disabled={disabled}
        maxLines={10}
        enterPressed={() => {
          setConfigurationValue(value);
        }}
        onBlur={() => {
          setConfigurationValue(value);
        }}
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
