import { useState } from "react";
import { DefenceConfig } from "../../models/defence";

import "./DefenceConfiguration.css";
import DefenceConfigurationInput from "./DefenceConfigurationInput";

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

  function setConfigurationValueIfDifferent() {
    // only apply the value if it's different
    if (value !== config.value) {
      void setConfigurationValue(config.id, value.trim());
    }
  }

  return (
    <div className="defence-configuration">
      <span>{config.name}: </span>
      <DefenceConfigurationInput
        content={value}
        setContent={setValue}
        disabled={!isActive}
        maxLines={10}
        inputType={config.inputType}
        setConfigurationValue={setConfigurationValueIfDifferent}
      />
    </div>
  );
}

export default DefenceConfiguration;
