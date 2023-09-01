import { useState } from "react";
import { DefenceConfig, DefenceInfo } from "../../models/defence";
import { validateDefence } from "../../service/defenceService";
import "./DefenceMechanism.css";
import "../StrategyBox/StrategyMechanism.css";
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
  setDefenceActive: (defenceId: string) => void;
  setDefenceInactive: (defenceId: string) => void;
  setDefenceConfiguration: (
    defenceId: string,
    config: DefenceConfig[]
  ) => Promise<boolean>;
}) {
  const [isInfoBoxVisible, setIsInfoBoxVisible] = useState<boolean>(false);
  const [isConfigured, setIsConfigured] = useState<boolean>(false);
  const [configValidated, setConfigValidated] = useState<boolean>(true);

  const setConfigurationValue = async (configId: string, value: string) => {
    const configName =
      defenceDetail.config.find((config) => config.id === configId)?.name || "";

    const configIsValid = validateDefence(defenceDetail.id, configName, value);
    if (configIsValid) {
      const newConfiguration = defenceDetail.config.map((config) => {
        if (config.id === configId) {
          config.value = value;
        }
        return config;
      });
      setDefenceConfiguration(defenceDetail.id, newConfiguration).then(
        (configured) => {
          setIsConfigured(true);
          setConfigValidated(configured);
        }
      );
    } else {
      setConfigValidated(false);
      setIsConfigured(true);
    }

    // hide the message after 3 seconds
    setTimeout(() => {
      setIsConfigured(false);
    }, 3000);
  };

  return (
    <span>
      <div
        className="strategy-mechanism defence-mechanism"
        onMouseOver={() => {
          setIsInfoBoxVisible(true);
        }}
        onMouseLeave={() => {
          setIsInfoBoxVisible(false);
        }}
      >
        <div className="strategy-mechanism-header">
          <span>{defenceDetail.name}</span>
          <label className="switch" >
            <input 
              type="checkbox" 
              placeholder="defence-toggle" 
              onClick={() => {
                defenceDetail.isActive
                  ? setDefenceInactive(defenceDetail.id)
                  : setDefenceActive(defenceDetail.id);
              }}
              // set checked if defence is active
              checked={defenceDetail.isActive}
            />
            <span className="slider round"></span>
          </label>
        </div>
        {isInfoBoxVisible ? (
          <div className="strategy-mechanism-info-box">
            <div>{defenceDetail.info}</div>

            {defenceDetail.config && showConfigurations ? (
              <div className="defence-mechanism-config">
                {defenceDetail.config.map((config) => {
                  return (
                    <DefenceConfiguration
                      key={config.id}
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
