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
      void setConfigurationValue(config.id, value);
    }
  }

  return (
    <div className="defence-configuration">
      <span>{config.name}: </span>
      <ThemedTextArea
        content={value}
        setContent={setValue}
        disabled={!isActive}
        maxLines={10}
        enterPressed={applyConfigurationValue}
        onBlur={applyConfigurationValue}
      />
    </div>
  );
}

export default DefenceConfiguration;
