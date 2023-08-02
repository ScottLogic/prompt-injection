import "./DefenceMechanism.css";
import "../StrategyBox/StrategyMechanism.css";
import React from "react";

function DefenceMechanism(props) {
  const [isInfoBoxVisible, setIsInfoBoxVisible] = React.useState(false);

  const ANIMATION_FLASH_TIME_SECONDS = 1;
  const ANIMATION_FLASH_REPEAT = 3;

  return (
    <span>
      <div
        className={
          props.isActive
            ? "strategy-mechanism defence-active"
            : "strategy-mechanism"
        }
        style={
          props.isTriggered
            ? props.isActive
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
          props.isActive
            ? props.setDefenceInactive(props.id)
            : props.setDefenceActive(props.id);
        }}
      >
        <div className="strategy-mechanism-header">
          <span className="defence-mechanism-name">{props.name}</span>
          <span
            className="strategy-mechanism-info"
            onMouseOver={() => {
              setIsInfoBoxVisible(true);
            }}
            onMouseLeave={() => {
              setIsInfoBoxVisible(false);
            }}
          >
            <span>?</span>
          </span>
        </div>
        {isInfoBoxVisible ? (
          <div className="strategy-mechanism-info-box">{props.info}</div>
        ) : null}
      </div>
    </span>
  );
}

export default DefenceMechanism;
