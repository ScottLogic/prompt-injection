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
  const [isInfoBoxVisible, setIsInfoBoxVisible] = useState<boolean>(false);
  const [isConfigured, setIsConfigured] = useState<boolean>(false);
  const [configValidated, setConfigValidated] = useState<boolean>(true);

  function toggleDefenceInfo() {
    setIsInfoBoxVisible(!isInfoBoxVisible);
  }

  async function setConfigurationValue(configId: string, value: string) {
    const configName =
      defenceDetail.config.find((config) => config.id === configId)?.name ?? "";

    const configIsValid = validateDefence(defenceDetail.id, configName, value);
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
    <span>
      <div
        className="defence-mechanism defence-mechanism"
        onClick={toggleDefenceInfo}
      >
        <div className="defence-mechanism-header">
          <span>{defenceDetail.name}</span>
          <label className="switch">
            <input
              type="checkbox"
              placeholder="defence-toggle"
              onChange={toggleDefence}
              // set checked if defence is active
              checked={defenceDetail.isActive}
            />
            <span className="slider round"></span>
          </label>
        </div>
        {isInfoBoxVisible ? (
          <div className="defence-mechanism-info-box">
            <div>{defenceDetail.info}</div>

            {showConfigurations ? (
              <div className="defence-mechanism-config">
                {defenceDetail.config.map((config) => {
                  return (
                    <DefenceConfiguration
                      key={config.id}
                      isActive={defenceDetail.isActive}
                      config={config}
                      setConfigurationValue={setConfigurationValue}
                    />
                  );
                })}
              </div>
            ) : null}

            {isConfigured ? (
              <div className="defence-mechanism-config-validated">
                {configValidated ? (
                  <p className="validation-text">
                    <TiTick /> defence successfully configured
                  </p>
                ) : (
                  <p className="validation-text">
                    <TiTimes /> invalid input - configuration failed
                  </p>
                )}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </span>
  );
}

export default DefenceMechanism;
