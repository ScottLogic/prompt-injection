import { DefenceConfig } from "../../models/defence";
import ThemedButton from "../ThemedButtons/ThemedButton";
import DefenceConfigurationInput from "./DefenceConfigurationInput";
import "./DefenceConfiguration.css";

function DefenceConfiguration({
  config,
  isActive,
  setConfigurationValue,
  resetConfigurationValue,
}: {
  config: DefenceConfig;
  isActive: boolean;
  setConfigurationValue: (configId: string, value: string) => Promise<void>;
  resetConfigurationValue: (configId: string) => void;
}) {
  function setConfigurationValueIfDifferent(value: string) {
    if (value !== config.value) {
      void setConfigurationValue(config.id, value.trim());
    }
  }

  return (
    <div className="defence-configuration">
      <div className="header">
        <span>{config.name}: </span>
        <ThemedButton
          onClick={() => {
            resetConfigurationValue(config.id);
          }}
          title="reset to default"
        >
          reset
        </ThemedButton>
      </div>
      <DefenceConfigurationInput
        currentValue={config.value}
        disabled={!isActive}
        inputType={config.inputType}
        setConfigurationValue={setConfigurationValueIfDifferent}
      />
    </div>
  );
}

export default DefenceConfiguration;
