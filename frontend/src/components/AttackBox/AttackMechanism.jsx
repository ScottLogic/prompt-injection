import "../StrategyBox/StrategyMechanism.css";
import React from "react";

function DefenceMechanism(props) {
  const [isInfoBoxVisible, setIsInfoBoxVisible] = React.useState(false);

  return (
    <span>
      <div className="strategy-mechanism">
        <div className="strategy-mechanism-header">
          <span>{props.attack.name}</span>
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
          <div className="strategy-mechanism-info-box">{props.attack.info}</div>
        ) : null}
      </div>
    </span>
  );
}

export default DefenceMechanism;
