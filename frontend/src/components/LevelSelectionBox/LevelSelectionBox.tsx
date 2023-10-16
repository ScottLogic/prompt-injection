import { Level, LEVEL_NAMES } from "../../models/level";
import { LEVELS } from "../../Levels";

import "./LevelSelectionBox.css";
import ThemedButton from "../ThemedButtons/ThemedButton";

function LevelSelectionBox({
  currentLevel,
  numCompletedLevels,
  setNewLevel,
}: {
  currentLevel: LEVEL_NAMES;
  numCompletedLevels: number;
  setNewLevel: (newLevel: number) => void;
}) {
  function handleLevelChange(newLevel: LEVEL_NAMES) {
    if (newLevel !== currentLevel) {
      console.log(`Changing level to ${newLevel}`);
      setNewLevel(newLevel);
    }
  }

  return (
    <span>
      <div id="level-selection-box">
        {LEVELS.map((level: Level, index: number) => {
          return (
            <ThemedButton
              key={level.name}
              onClick={() => {
                handleLevelChange(level.id);
              }}
              isDisabled={
                currentLevel === LEVEL_NAMES.SANDBOX
                  ? level.id !== LEVEL_NAMES.SANDBOX
                  : index > numCompletedLevels
              }
              isSelected={level.id === currentLevel}
            >
              {level.name}
            </ThemedButton>
          );
        })}
      </div>
    </span>
  );
}

export default LevelSelectionBox;
