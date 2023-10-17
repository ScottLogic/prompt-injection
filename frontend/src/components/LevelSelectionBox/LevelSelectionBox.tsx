import { Level, LEVEL_NAMES } from "../../models/level";
import { LEVELS } from "../../Levels";
import ThemedButton from "../ThemedButtons/ThemedButton";
import "./LevelSelectionBox.css";

export interface LevelSelectionBoxProps {
  currentLevel: LEVEL_NAMES;
  numCompletedLevels: number;
  setNewLevel: (newLevel: number) => void;
}

function LevelSelectionBox({
  currentLevel,
  numCompletedLevels,
  setNewLevel,
}: LevelSelectionBoxProps) {
  // hide all levels in sandbox, and show levels 1-3 in story mode
  const displayLevels =
    currentLevel !== LEVEL_NAMES.SANDBOX ? LEVELS.slice(0, 3) : [];

  function handleLevelChange(newLevel: LEVEL_NAMES) {
    if (newLevel !== currentLevel) {
      setNewLevel(newLevel);
    }
  }
  return (
    <div id="level-selection-box">
      {displayLevels.map((level: Level, index: number) => {
        return (
          <ThemedButton
            key={level.name}
            onClick={() => {
              handleLevelChange(level.id);
            }}
            isDisabled={index > numCompletedLevels}
            isSelected={level.id === currentLevel}
          >
            {level.name}
          </ThemedButton>
        );
      })}
    </div>
  );
}

export default LevelSelectionBox;
