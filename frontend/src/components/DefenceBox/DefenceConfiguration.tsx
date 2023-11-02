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
  resetConfigurationValue: (configId: string) => Promise<string>;
}) {
  async function resetConfiguration() {
    const defaultValue = await resetConfigurationValue(config.id);
    void setConfigurationValue(config.id, defaultValue.trim());
  }
  function setConfigurationValueIfDifferent(value: string) {
    if (value !== config.value) {
      void setConfigurationValue(config.id, value.trim());
    }
  }

  return (
    <div className="defence-configuration">
      <div className="defence-configuration-header">
        <span>{config.name}: </span>
        <ThemedButton onClick={() => void resetConfiguration()}>
          reset
        </ThemedButton>
      </div>
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
