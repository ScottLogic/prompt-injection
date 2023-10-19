import { LEVEL_NAMES } from "../../models/level";

function SwitchModeButton({
  currentLevel,
  onClick,
}: {
  currentLevel: LEVEL_NAMES;
  onClick: () => void;
}) {
  return (
    <button className="themed-button" onClick={onClick}>
      {currentLevel === LEVEL_NAMES.SANDBOX
        ? "Sandbox mode. Click here to select story mode."
        : "Story mode. Click here to select sandbox mode."}
    </button>
  );
}

export default SwitchModeButton;
