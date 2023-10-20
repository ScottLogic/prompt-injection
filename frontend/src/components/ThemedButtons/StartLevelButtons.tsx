import { clsx } from "clsx";
import { LEVEL_NAMES } from "../../models/level";
import "./StartLevelButtons.css";

function StartLevelButtons({
  currentLevel,
  setStartLevel,
}: {
  currentLevel: LEVEL_NAMES;
  setStartLevel: (newLevel: LEVEL_NAMES) => void;
}) {
  const levels = [
    { name: "Beginner", targetLevel: LEVEL_NAMES.LEVEL_1 },
    { name: "Expert", targetLevel: LEVEL_NAMES.SANDBOX },
  ];

  function handleLevelClick(level: LEVEL_NAMES) {
    setStartLevel(level);
  }

  // whether to show Beginner or Expert as button depending on level
  function defaultButton(targetLevel: LEVEL_NAMES) {
    return currentLevel < LEVEL_NAMES.SANDBOX
      ? targetLevel === LEVEL_NAMES.LEVEL_1
      : targetLevel === LEVEL_NAMES.SANDBOX;
  }

  return (
    <ul
      className="start-level-selection-buttons"
      aria-label="start mode selector"
    >
      {levels.map((level) => (
        <li
          key={level.targetLevel}
          aria-current={defaultButton(level.targetLevel) ? "page" : undefined}
        >
          <button
            className={clsx("level-button", {
              selected: defaultButton(level.targetLevel),
            })}
            onClick={() => {
              handleLevelClick(level.targetLevel);
            }}
          >
            {level.name}
          </button>
        </li>
      ))}
    </ul>
  );
}

export default StartLevelButtons;
