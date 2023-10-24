import { LEVEL_NAMES, ModeSelectButton } from "../../models/level";
import ModeSelectButtons from "./ModeSelectButtons";

function StartLevelButtons({
  currentLevel,
  setStartLevel,
}: {
  currentLevel: LEVEL_NAMES;
  setStartLevel: (newLevel: LEVEL_NAMES) => void;
}) {
  const levels: ModeSelectButton[] = [
    { displayName: "Beginner", targetLevel: LEVEL_NAMES.LEVEL_1 },
    { displayName: "Expert", targetLevel: LEVEL_NAMES.SANDBOX },
  ];

  return (
    <ModeSelectButtons
      defaultSelection={currentLevel}
      modeButtons={levels}
      setLevel={setStartLevel}
    />
  );
}

export default StartLevelButtons;
