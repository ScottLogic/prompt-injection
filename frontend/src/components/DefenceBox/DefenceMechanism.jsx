import "./DefenceMechanism.css";
import React from "react";

function DefenceMechanism(props) {
  const [isInfoBoxVisible, setIsInfoBoxVisible] = React.useState(false);

  const ANIMATION_FLASH_TIME_SECONDS = 1;
  const ANIMATION_FLASH_REPEAT = 3;

  return (
    <span>
      <div
        className={
          props.defence.isActive
            ? "defence-mechanism defence-active"
            : "defence-mechanism"
        }
        onMouseOver={() => {
          setIsInfoBoxVisible(true);
        }}
        onMouseLeave={() => {
          setIsInfoBoxVisible(false);
        }}
        style={
          props.defence.isTriggered
            ? props.defence.isActive
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
          props.defence.isActive
            ? props.setDefenceInactive(props.defence.id)
            : props.setDefenceActive(props.defence.id);
        }}
      >
        <div className="defence-mechanism-header">
          <span className="defence-mechanism-name">{props.defence.name}</span>
        </div>
        {isInfoBoxVisible ? (
          <div className="defence-mechanism-info-box">{props.defence.info}</div>
        ) : null}
      </div>
    </span>
  );
}

export default DefenceMechanism;
