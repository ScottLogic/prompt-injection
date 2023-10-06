import { useState } from "react";
import {
  DEFENCE_TYPES,
  DefenceConfig,
  DefenceInfo,
} from "../../models/defence";
import { validateDefence } from "../../service/defenceService";
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

  async function setConfigurationValue(config: DefenceConfig, value: string) {
    // don't set if the value is the same
    if (config.value === value) {
      return;
    }

    const configIsValid = validateDefence(defenceDetail.id, config.name, value);
    if (configIsValid) {
      const newConfiguration = defenceDetail.config.map((oldConfig) => {
        if (oldConfig.id === config.id) {
          oldConfig.value = value;
        }
        return oldConfig;
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
    <div className="defence-mechanism">
      <details>
        <summary>{defenceDetail.name}</summary>
        <div className="info-box">
          <p>{defenceDetail.info}</p>

          {showConfigurations &&
            defenceDetail.config.map((config) => {
              return (
                <DefenceConfiguration
                  key={config.id}
                  isActive={defenceDetail.isActive}
                  config={config}
                  setConfigurationValue={(value: string) => {
                    // asynchronously set the configuration value
                    void setConfigurationValue(config, value);
                  }}
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
      <label className="switch">
        <input
          type="checkbox"
          placeholder="defence-toggle"
          onChange={toggleDefence}
          // set checked if defence is active
          checked={defenceDetail.isActive}
          aria-label="toggle defence"
        />
        <span className="slider round"></span>
      </label>
    </div>
  );
}

export default DefenceMechanism;
