import { LEVELS } from "../../Levels";
import { LEVEL_NAMES } from "../../models/level";
import LevelSelectionBox from "../LevelSelectionBox/LevelSelectionBox";
import HandbookIcon from "./HandbookIcon";
import "./MainHeader.css";
import ProjectIcon from "./ProjectIcon";
import ProjectIconWon from "./ProjectIconWon";

function MainHeader({
  currentLevel,
  numCompletedLevels,
  openHandbook,
  setNewLevel,
}: {
  currentLevel: LEVEL_NAMES;
  numCompletedLevels: number;
  openHandbook: () => void;
  setNewLevel: (newLevel: number) => void;
}) {
  function getLevelName(level: LEVEL_NAMES) {
    const levelName = LEVELS.find((p) => p.id === level)?.name;
    return levelName ?? "";
  }

  const isLevelComplete = (currentLevel as number) < numCompletedLevels;

  return (
    <div id="main-header">
      <span id="main-header-left">
        <span id="main-header-title">Prompt Injection Demo</span>
        <span id="main-header-icon">
          {isLevelComplete ? <ProjectIconWon /> : <ProjectIcon />}
        </span>
      </span>
      <span id="main-header-middle">
        <span id="main-header-current-level">{getLevelName(currentLevel)}</span>
      </span>
      <span id="main-header-right">
        <span id="main-header-level-selection">
          <LevelSelectionBox
            currentLevel={currentLevel}
            numCompletedLevels={numCompletedLevels}
            setNewLevel={setNewLevel}
          />
        </span>
        <span id="handbook-icon" onClick={openHandbook}>
          <HandbookIcon />
        </span>
      </span>
    </div>
  );
}

export default MainHeader;
