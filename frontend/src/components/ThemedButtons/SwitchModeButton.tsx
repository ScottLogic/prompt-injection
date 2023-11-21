import "./SwitchModeButton.css";

import { LEVEL_NAMES } from "@src/models/level";

function SwitchModeButton({
  currentLevel,
  onClick,
}: {
  currentLevel: LEVEL_NAMES;
  onClick: () => void;
}) {
  return (
    <div className="switch-mode-button-container">
      <button className="themed-button" onClick={onClick}>
        {currentLevel === LEVEL_NAMES.SANDBOX
          ? "Sandbox mode. Click here to select story mode."
          : "Story mode. Click here to select sandbox mode."}
      </button>
    </div>
  );
}

export default SwitchModeButton;
