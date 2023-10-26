import ThemedTextArea from "../ThemedUserInput/ThemedTextArea";
import ThemedNumberInput from "../ThemedUserInput/ThemedNumberInput";

function DefenceConfigurationInput({
  content,
  disabled,
  inputType,
  maxLines,
  setContent,
  setConfigurationValue,
}: {
  content: string;
  disabled: boolean;
  inputType: "text" | "number";
  maxLines: number;
  setContent: (text: string) => void;
  setConfigurationValue: () => void;
}) {
  if (inputType === "text") {
    return (
      <ThemedTextArea
        content={content}
        setContent={setContent}
        disabled={disabled}
        maxLines={maxLines}
        enterPressed={setConfigurationValue}
        onBlur={setConfigurationValue}
      />
    );
  } else {
    return (
      <ThemedNumberInput
        content={content}
        setContent={setContent}
        disabled={disabled}
        enterPressed={setConfigurationValue}
        onBlur={setConfigurationValue}
      />
    );
  }
}

export default DefenceConfigurationInput;
