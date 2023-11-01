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
  function setConfigurationValueIfDifferent(value: string) {
    if (value !== config.value) {
      void setConfigurationValue(config.id, value.trim());
    }
  }

  return (
    <div className="defence-configuration">
      <span>{config.name}: </span>
      <DefenceConfigurationInput
        defaultValue={config.value}
        disabled={!isActive}
        inputType={config.inputType}
        setConfigurationValue={setConfigurationValueIfDifferent}
      />
    </div>
  );
}

export default DefenceConfiguration;
