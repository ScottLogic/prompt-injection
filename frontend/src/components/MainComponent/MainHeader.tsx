import HandbookIcon from "./HandbookIcon";
import "./MainHeader.css";
import ProjectIcon from "./ProjectIcon";
import ProjectIconWon from "./ProjectIconWon";

import { LEVELS } from "@src/Levels";
import LevelSelectionBox from "@src/components/LevelSelectionBox/LevelSelectionBox";
import { LEVEL_NAMES } from "@src/models/level";

function MainHeader({
  currentLevel,
  numCompletedLevels,
  openHandbook,
  setCurrentLevel,
}: {
  currentLevel: LEVEL_NAMES;
  numCompletedLevels: number;
  openHandbook: () => void;
  setCurrentLevel: (newLevel: LEVEL_NAMES) => void;
}) {
  function getLevelName(level: LEVEL_NAMES) {
    const levelName = LEVELS.find((p) => p.id === level)?.name;
    return levelName ?? "";
  }

  const isLevelComplete = (currentLevel as number) < numCompletedLevels;

  return (
    <header className="main-header">
      <span className="main-header-left">
        <span className="main-header-title">Spy Logic</span>
        <span className="main-header-icon">
          {isLevelComplete ? <ProjectIconWon /> : <ProjectIcon />}
        </span>
      </span>
      <span className="main-header-middle">
        <span className="main-header-current-level">
          {getLevelName(currentLevel)}
        </span>
      </span>
      <span className="main-header-right">
        {currentLevel !== LEVEL_NAMES.SANDBOX && (
          <span className="main-header-level-selection">
            <LevelSelectionBox
              currentLevel={currentLevel}
              numCompletedLevels={numCompletedLevels}
              setCurrentLevel={setCurrentLevel}
            />
          </span>
        )}
        <div className="handbook-area">
          <button
            className="prompt-injection-min-button handbook-icon"
            title="open the handbook"
            aria-label="open the handbook"
            onClick={openHandbook}
          >
            <HandbookIcon />
          </button>
        </div>
      </span>
    </header>
  );
}

export default MainHeader;
