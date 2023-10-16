import { LEVEL_NAMES } from "../../models/level";
import "./OverlayWelcome.css";

function StartLevelButton({
  label,
  defaultButton,
  targetStartLevel,
  selectedButton,
  setStartLevel,
  setSelectedButton,
}: {
  label: string;
  defaultButton: LEVEL_NAMES;
  targetStartLevel: LEVEL_NAMES;
  selectedButton: LEVEL_NAMES;
  setStartLevel: (startLevel: LEVEL_NAMES) => void;
  setSelectedButton: (level: LEVEL_NAMES) => void;
}) {
  return (
    <button
      aria-pressed={selectedButton === targetStartLevel}
      onClick={() => {
        setStartLevel(targetStartLevel);
      }}
      onMouseEnter={() => {
        setSelectedButton(targetStartLevel);
      }}
      onMouseLeave={() => {
        setSelectedButton(defaultButton);
      }}
    >
      {label}
    </button>
  );
}

export default StartLevelButton;
