import { FocusEvent, KeyboardEvent } from "react";
import ContentEditable from "react-contenteditable";
import { clsx } from "clsx";
import { DefenceConfig } from "../../models/defence";

import "./DefenceConfiguration.css";

function DefenceConfiguration({
  config,
  isActive,
  setConfigurationValue,
}: {
  config: DefenceConfig;
  isActive: boolean;
  setConfigurationValue: (configId: string, value: string) => Promise<void>;
}) {
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
    }
  }

  function focusLost(event: FocusEvent<HTMLDivElement>) {
    const value = event.target.innerText.trim();
    // asynchronously set the configuration value
    void setConfigurationValue(config.id, value);
  }

  const configClass = clsx("defence-config-value", {
    inactive: !isActive,
  });

  return (
    <div>
      <span className="defence-config-name">{config.name}: </span>
      <ContentEditable
        className={configClass}
        html={config.value.toString()}
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
