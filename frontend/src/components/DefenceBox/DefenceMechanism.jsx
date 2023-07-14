import "./DefenceMechanism.css";
import React from "react";

function DefenceMechanism(props) {
  const [isInfoBoxVisible, setIsInfoBoxVisible] = React.useState(false);

  // only show the info box when the user hovers over the info span
  const showInfoBox = () => {
    setIsInfoBoxVisible(true);
  };
  const hideInfoBox = () => {
    setIsInfoBoxVisible(false);
  };

  return (
    <span>
      <div className="defence-mechanism">
        <div className="defence-mechanism-header">
          <span className="defence-mechanism-name">{props.name}</span>
          <span
            className="defence-mechanism-info"
            onMouseOver={showInfoBox.bind(this)}
            onMouseLeave={hideInfoBox.bind(this)}
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
