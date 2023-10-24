import { clsx } from "clsx";
import { LEVEL_NAMES, LevelSelectButton } from "../../models/level";
import "./LevelSelectButtons.css";

function LevelSelectButtons({
  defaultSelection,
  levelButtons,
  setStartLevel,
}: {
  levelButtons: LevelSelectButton[];
  defaultSelection: LEVEL_NAMES;
  setStartLevel: (newLevel: LEVEL_NAMES) => void;
}) {
  function handleLevelClick(level: LEVEL_NAMES) {
    setStartLevel(level);
  }

  function defaultButton(targetLevel: LEVEL_NAMES) {
    return targetLevel === defaultSelection;
  }

  return (
    <ul className="level-selection-buttons" aria-label="level selector">
      {levelButtons.map((levelButton) => (
        <li
          key={levelButton.targetLevel}
          aria-current={
            defaultButton(levelButton.targetLevel) ? "page" : undefined
          }
        >
          <button
            className={clsx("level-button", {
              selected: defaultButton(levelButton.targetLevel),
            })}
            onClick={() => {
              handleLevelClick(levelButton.targetLevel);
            }}
          >
            {levelButton.displayName}
          </button>
        </li>
      ))}
    </ul>
  );
}

export default LevelSelectButtons;
