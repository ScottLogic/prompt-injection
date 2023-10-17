import { useState } from "react";
import { LEVEL_NAMES } from "../../models/level";

import "./StartLevelButtons.css";

function StartLevelButtons({
  currentLevel,
  setStartLevel,
}: {
  currentLevel: LEVEL_NAMES;
  setStartLevel: (newLevel: LEVEL_NAMES) => void;
}) {
  // highlight the default button based on current level
  const defaultButton = currentLevel;
  const [selectButton, setSelectButton] = useState(defaultButton);

  const levels = [
    { name: "Beginner", targetLevel: LEVEL_NAMES.LEVEL_1 },
    { name: "Expert", targetLevel: LEVEL_NAMES.SANDBOX },
  ];

  // eslint-disable-next-line func-style
  const handleLevelClick = (level: LEVEL_NAMES) => {
    setSelectButton(level);
    setStartLevel(level);
  };

  return (
    <ul className="start-level-selection-buttons">
      {levels.map((level) => (
        <li
          key={level.targetLevel}
          aria-current={level.targetLevel === selectButton ? "page" : undefined}
        >
          <button
            className={`level-button ${
              level.targetLevel === selectButton ? "selected" : ""
            }`}
            onClick={() => {
              handleLevelClick(level.targetLevel);
            }}
            onMouseEnter={() => {
              setSelectButton(level.targetLevel);
            }}
            onMouseLeave={() => {
              setSelectButton(defaultButton);
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
