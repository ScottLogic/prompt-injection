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
    const validation = validateDefence(defenceDetail.id, configName, value);

    if (validation) {
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
        className={
          defenceDetail.isActive
            ? "strategy-mechanism defence-mechanism prompt-injection-button defence-active"
            : "strategy-mechanism defence-mechanism prompt-injection-button"
        }
        onMouseOver={() => {
          setIsInfoBoxVisible(true);
        }}
        onMouseLeave={() => {
          setIsInfoBoxVisible(false);
        }}
        // style={
        //   defenceDetail.isTriggered
        //     ? defenceDetail.isActive
        //       ? {
        //           animation:
        //             "flash-red-active " +
        //             ANIMATION_FLASH_TIME_SECONDS +
        //             "s linear 0s " +
        //             ANIMATION_FLASH_REPEAT +
        //             " forwards",
        //         }
        //       : {
        //           animation:
        //             "flash-red-inactive " +
        //             ANIMATION_FLASH_TIME_SECONDS +
        //             "s linear 0s " +
        //             ANIMATION_FLASH_REPEAT +
        //             " forwards",
        //         }
        //     : { animation: "none" }
        // }
        onClick={() => {
          defenceDetail.isActive
            ? setDefenceInactive(defenceDetail.id)
            : setDefenceActive(defenceDetail.id);
        }}
      >
        <div className="strategy-mechanism-header">
          <span>{defenceDetail.name}</span>
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
