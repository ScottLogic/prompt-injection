import { useState } from "react";
import {
  DEFENCE_TYPES,
  DefenceConfig,
  DefenceInfo,
} from "../../models/defence";
import {
  resetDefenceConfig,
  validateDefence,
} from "../../service/defenceService";
import "./DefenceMechanism.css";
import DefenceConfiguration from "./DefenceConfiguration";
import { TiTick, TiTimes } from "react-icons/ti";

function DefenceMechanism({
  defenceDetail,
  showConfigurations,
  setDefenceActive,
  setDefenceInactive,
  setDefenceConfiguration,
}: {
  defenceDetail: DefenceInfo;
  showConfigurations: boolean;
  setDefenceActive: (defence: DefenceInfo) => void;
  setDefenceInactive: (defence: DefenceInfo) => void;
  setDefenceConfiguration: (
    defenceId: DEFENCE_TYPES,
    config: DefenceConfig[]
  ) => Promise<boolean>;
}) {
  const [isConfigured, setIsConfigured] = useState<boolean>(false);
  const [configValidated, setConfigValidated] = useState<boolean>(true);
  const [configKey, setConfigKey] = useState<number>(0);

  async function resetConfigurationValue(configId: string): Promise<string> {
    const defaultValue = await resetDefenceConfig(defenceDetail.id, configId);
    return defaultValue.value;
  }

  async function setConfigurationValue(configId: string, value: string) {
    const configIsValid = validateDefence(defenceDetail.id, value);
    if (configIsValid) {
      const newConfiguration = defenceDetail.config.map((config) => {
        if (config.id === configId) {
          config.value = value;
        }
        return config;
      });

      const configured = await setDefenceConfiguration(
        defenceDetail.id,
        newConfiguration
      );
      setIsConfigured(true);
      setConfigValidated(configured);
    } else {
      setConfigValidated(false);
      setIsConfigured(true);
    }

    // hide the message after 3 seconds
    setTimeout(() => {
      setIsConfigured(false);
    }, 3000);
  }

  function toggleDefence() {
    defenceDetail.isActive
      ? setDefenceInactive(defenceDetail)
      : setDefenceActive(defenceDetail);
  }

  return (
    <details
      className="defence-mechanism"
      onToggle={() => {
        // re-render the configuration component when detail is toggled
        // this is to resize the textarea when detail is expanded
        setConfigKey(configKey + 1);
      }}
    >
      <summary>
        <span aria-hidden>{defenceDetail.name}</span>
        <label className="switch">
          <input
            type="checkbox"
            placeholder="defence-toggle"
            onChange={toggleDefence}
            // set checked if defence is active
            checked={defenceDetail.isActive}
            aria-label={defenceDetail.name}
          />
          <span className="slider round"></span>
        </label>
      </summary>
      <div className="info-box">
        <p>{defenceDetail.info}</p>
        {showConfigurations &&
          defenceDetail.config.map((config) => {
            return (
              <DefenceConfiguration
                key={config.id + configKey}
                isActive={defenceDetail.isActive}
                config={config}
                setConfigurationValue={setConfigurationValue}
                resetConfigurationValue={resetConfigurationValue}
              />
            );
          })}
        {isConfigured &&
          (configValidated ? (
            <p className="validation-text">
              <TiTick /> defence successfully configured
            </p>
          ) : (
            <p className="validation-text">
              <TiTimes /> invalid input - configuration failed
            </p>
          ))}
      </div>
    </details>
  );
}

export default DefenceMechanism;
