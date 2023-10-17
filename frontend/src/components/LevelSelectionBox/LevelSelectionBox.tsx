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
  function handleLevelChange(newLevel: LEVEL_NAMES) {
    if (newLevel !== currentLevel) {
      setNewLevel(newLevel);
    }
  }

  return (
    <div id="level-selection-box">
      {LEVELS.map((level: Level, index: number) => {
        return (
          <ThemedButton
            key={level.name}
            onClick={() => {
              handleLevelChange(level.id);
            }}
            isDisabled={
              index > numCompletedLevels && level.id !== LEVEL_NAMES.SANDBOX
            }
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
