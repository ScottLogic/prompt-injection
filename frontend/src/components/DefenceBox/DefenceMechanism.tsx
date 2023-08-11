import { useState } from "react";
import { DefenceConfig, DefenceInfo } from "../../models/defence";
import "./DefenceMechanism.css";
import "../StrategyBox/StrategyMechanism.css";
import DefenceConfiguration from "./DefenceConfiguration";

function DefenceMechanism({
  defenceDetail,
  setDefenceActive,
  setDefenceInactive,
  setDefenceConfiguration,
}: {
  defenceDetail: DefenceInfo;
  setDefenceActive: (defenceId: string) => void;
  setDefenceInactive: (defenceId: string) => void;
  setDefenceConfiguration: (defenceId: string, config: DefenceConfig[]) => void;
}) {
  const [isInfoBoxVisible, setIsInfoBoxVisible] = useState<boolean>(false);

  const ANIMATION_FLASH_TIME_SECONDS = 1;
  const ANIMATION_FLASH_REPEAT = 3;

  const setConfigurationValue = (configId: string, value: string) => {
    const newConfiguration = defenceDetail.config.map((config) => {
      if (config.id === configId) {
        config.value = value;
      }
      return config;
    });
    setDefenceConfiguration(defenceDetail.id, newConfiguration);
  };

  return (
    <span>
      <div
        className={
          defenceDetail.isActive
            ? "strategy-mechanism defence-mechanism defence-active"
            : "strategy-mechanism defence-mechanism"
        }
        onMouseOver={() => {
          setIsInfoBoxVisible(true);
        }}
        onMouseLeave={() => {
          setIsInfoBoxVisible(false);
        }}
        style={
          defenceDetail.isTriggered
            ? defenceDetail.isActive
              ? {
                  animation:
                    "flash-red-active " +
                    ANIMATION_FLASH_TIME_SECONDS +
                    "s linear 0s " +
                    ANIMATION_FLASH_REPEAT +
                    " forwards",
                }
              : {
                  animation:
                    "flash-red-inactive " +
                    ANIMATION_FLASH_TIME_SECONDS +
                    "s linear 0s " +
                    ANIMATION_FLASH_REPEAT +
                    " forwards",
                }
            : { animation: "none" }
        }
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
            {defenceDetail.config ? (
              <div className="defence-mechanism-config">
                {defenceDetail.config.map((config, index) => {
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
          </div>
        ) : null}
      </div>
    </span>
  );
}

export default DefenceMechanism;
