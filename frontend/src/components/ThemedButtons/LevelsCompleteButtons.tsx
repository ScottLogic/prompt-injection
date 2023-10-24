import { LEVEL_NAMES, LevelSelectButton } from "../../models/level";
import LevelSelectButtons from "./LevelSelectButtons";

function LevelsCompleteButtons({
  setStartLevel,
}: {
  setStartLevel: (newLevel: LEVEL_NAMES) => void;
}) {
  const lastLevel = LEVEL_NAMES.LEVEL_3;

  const levels: LevelSelectButton[] = [
    { displayName: "Stay here", targetLevel: lastLevel },
    { displayName: "Go to Sandbox", targetLevel: LEVEL_NAMES.SANDBOX },
  ];

  return (
    <LevelSelectButtons
      defaultSelection={lastLevel}
      levelButtons={levels}
      setStartLevel={setStartLevel}
    />
  );
}

export default LevelsCompleteButtons;
