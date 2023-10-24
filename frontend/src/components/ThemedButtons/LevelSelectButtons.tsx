import { clsx } from "clsx";
import { LEVEL_NAMES, LevelSelectButton } from "../../models/level";
import "./LevelSelectButtons.css";

function LevelSelectButtons({
  defaultSelection,
  levelButtons,
  setLevel,
}: {
  levelButtons: LevelSelectButton[];
  defaultSelection: LEVEL_NAMES;
  setLevel: (newLevel: LEVEL_NAMES) => void;
}) {
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
              setLevel(levelButton.targetLevel);
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
