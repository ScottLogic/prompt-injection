import { LEVEL_NAMES, LevelSelectButton } from "../../models/level";
import LevelSelectButtons from "./LevelSelectButtons";

function StartLevelButtons({
  currentLevel,
  setStartLevel,
}: {
  currentLevel: LEVEL_NAMES;
  setStartLevel: (newLevel: LEVEL_NAMES) => void;
}) {
  const levels: LevelSelectButton[] = [
    { displayName: "Beginner", targetLevel: LEVEL_NAMES.LEVEL_1 },
    { displayName: "Expert", targetLevel: LEVEL_NAMES.SANDBOX },
  ];

  return (
    <LevelSelectButtons
      defaultSelection={currentLevel}
      levelButtons={levels}
      setLevel={setStartLevel}
    />
  );
}

export default StartLevelButtons;
