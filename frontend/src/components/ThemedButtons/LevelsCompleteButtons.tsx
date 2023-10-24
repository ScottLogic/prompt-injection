import { LEVEL_NAMES, LevelSelectButton } from "../../models/level";
import LevelSelectButtons from "./LevelSelectButtons";

function LevelsCompleteButtons({
  closeOverlay,
  goToSandbox,
}: {
  closeOverlay: () => void;
  goToSandbox: () => void;
}) {
  const lastLevel = LEVEL_NAMES.LEVEL_3;

  const levels: LevelSelectButton[] = [
    { displayName: "Stay here", targetLevel: lastLevel },
    { displayName: "Go to Sandbox", targetLevel: LEVEL_NAMES.SANDBOX },
  ];

  function handleLevelSelect(newLevel: LEVEL_NAMES) {
    if (newLevel === LEVEL_NAMES.SANDBOX) {
      goToSandbox();
    } else {
      closeOverlay();
    }
  }

  return (
    <LevelSelectButtons
      defaultSelection={lastLevel}
      levelButtons={levels}
      setLevel={handleLevelSelect}
    />
  );
}

export default LevelsCompleteButtons;
