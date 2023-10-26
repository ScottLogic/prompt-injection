import { useState } from "react";
import { DefenceConfig } from "../../models/defence";

import "./DefenceConfiguration.css";
import ThemedTextArea from "../ThemedUserInput/ThemedTextArea";

function DefenceConfiguration({
  config,
  isActive,
  setConfigurationValue,
}: {
  config: DefenceConfig;
  isActive: boolean;
  setConfigurationValue: (configId: string, value: string) => Promise<void>;
}) {
  const [value, setValue] = useState<string>(config.value);

  function applyConfigurationValue() {
    // only apply the value if it's different
    if (value !== config.value) {
      void setConfigurationValue(config.id, value.trim());
    }
  }

  function onInputChanged(event: React.ChangeEvent<HTMLInputElement>) {
    setValue(event.target.value);
  }

  function onInputKeyUp(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      applyConfigurationValue();
    }
  }

  return (
    <div className="defence-configuration">
      <span>{config.name}: </span>
      {config.inputType === "text" && (
        <ThemedTextArea
          content={value}
          setContent={setValue}
          disabled={!isActive}
          maxLines={10}
          enterPressed={applyConfigurationValue}
          onBlur={applyConfigurationValue}
        />
      )}
      {config.inputType === "number" && (
        <input
          type="number"
          value={value}
          disabled={!isActive}
          onBlur={applyConfigurationValue}
          onChange={onInputChanged}
          onKeyUp={onInputKeyUp}
        />
      )}
    </div>
  );
}

export default DefenceConfiguration;
