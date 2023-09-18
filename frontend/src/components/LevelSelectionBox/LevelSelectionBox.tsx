import { Level, LEVEL_NAMES } from "../../models/level";
import { LEVELS } from "../../Levels";

import "./LevelSelectionBox.css";

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
            <button
              className={`prompt-injection-button level-selection-button ${
                level.id === currentLevel ? "selected" : ""
              }`}
              key={level.name}
              onClick={() => {
                handleLevelChange(level.id);
              }}
              disabled={
                index > numCompletedLevels && level.id !== LEVEL_NAMES.SANDBOX
              }
            >
              {level.name}
            </button>
          );
        })}
      </div>
    </span>
  );
}

export default LevelSelectionBox;
