import "./DefenceMechanism.css";
import React from "react";

function DefenceMechanism(props) {
  const [isInfoBoxVisible, setIsInfoBoxVisible] = React.useState(false);

  return (
    <span>
      <div
        className={
          props.isActive
            ? "defence-mechanism defence-active"
            : "defence-mechanism"
        }
        onClick={() => {
          props.isActive
            ? props.setDefenceInactive(props.id)
            : props.setDefenceActive(props.id);
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
