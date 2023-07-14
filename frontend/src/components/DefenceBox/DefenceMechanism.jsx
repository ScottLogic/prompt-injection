import "./DefenceMechanism.css";
import React from "react";

function DefenceMechanism(props) {
  const [isDefenceActive, setIsDefenceActive] = React.useState(false);
  const [isInfoBoxVisible, setIsInfoBoxVisible] = React.useState(false);

  return (
    <span>
      <div
        className={
          isDefenceActive
            ? "defence-mechanism defence-active"
            : "defence-mechanism"
        }
        onClick={() => {
          setIsDefenceActive(!isDefenceActive);
        }}
      >
        <div className="defence-mechanism-header">
          <span className="defence-mechanism-name">{props.name}</span>
          <span
            className="defence-mechanism-info"
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
          <div className="defence-mechanism-info-box">{props.info}</div>
        ) : null}
      </div>
    </span>
  );
}

export default DefenceMechanism;
