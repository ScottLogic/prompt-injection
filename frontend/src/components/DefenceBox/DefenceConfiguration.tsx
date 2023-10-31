import { FocusEvent, KeyboardEvent, useState } from "react";
import ContentEditable from "react-contenteditable";
import { clsx } from "clsx";
import { DefenceConfig } from "../../models/defence";

import "./DefenceConfiguration.css";
import ThemedButton from "../ThemedButtons/ThemedButton";

function DefenceConfiguration({
  config,
  isActive,
  setConfigurationValue,
  resetConfigurationValue,
}: {
  config: DefenceConfig;
  isActive: boolean;
  setConfigurationValue: (configId: string, value: string) => Promise<void>;
  resetConfigurationValue: (configId: string) => Promise<string>;
}) {
  const [displayValue, setDisplayValue] = useState(config.value);

  function inputKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      // stop new line from being input
      event.preventDefault();
    }
  }

  function inputKeyUp(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      const value = event.currentTarget.innerText.trim();
      // asynchronously set the configuration value
      void setConfigurationValue(config.id, value);
      setDisplayValue(value);
    }
  }

  function focusLost(event: FocusEvent<HTMLDivElement>) {
    const value = event.target.innerText.trim();
    // asynchronously set the configuration value
    void setConfigurationValue(config.id, value);
    setDisplayValue(value);
  }

  async function resetConfiguration() {
    const defaultValue = await resetConfigurationValue(config.id);
    setDisplayValue(defaultValue);
  }

  const configClass = clsx("defence-config-value", {
    inactive: !isActive,
  });

  return (
    <div>
      <div className="defence-config-header">
        <p>{config.name}</p>
        <ThemedButton onClick={() => void resetConfiguration()}>
          reset
        </ThemedButton>
      </div>
      <ContentEditable
        className={configClass}
        html={displayValue.toString()}
        onBlur={focusLost}
        onKeyDown={inputKeyDown}
        onKeyUp={inputKeyUp}
        onClick={(event) => {
          event.stopPropagation();
        }}
        onChange={() => {
          return;
        }}
        disabled={!isActive}
      />
    </div>
  );
}

export default DefenceConfiguration;
