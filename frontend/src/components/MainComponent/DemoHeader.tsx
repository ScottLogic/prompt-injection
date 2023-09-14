import { LEVELS } from "../../Levels";
import { LEVEL_NAMES } from "../../models/level";
import LevelSelectionBox from "../LevelSelectionBox/LevelSelectionBox";
import "./DemoHeader.css";
import ProjectIcon from "./ProjectIcon";
import ProjectIconWon from "./ProjectIconWon";

function DemoHeader({
  currentLevel,
  numCompletedLevels,
  setNewLevel,
}: {
  currentLevel: LEVEL_NAMES;
  numCompletedLevels: number;
  setNewLevel: (newLevel: number) => void;
}) {
  function getLevelName(level: LEVEL_NAMES) {
    const levelName = LEVELS.find((p) => p.id === level)?.name;
    return levelName ?? "";
  }

  const isLevelComplete = (currentLevel as number) < numCompletedLevels;

  return (
    <div id="demo-header">
      <span id="demo-header-left">
        <span id="demo-header-title">Prompt Injection Demo</span>
        <span id="demo-header-icon">
          {isLevelComplete ? <ProjectIconWon /> : <ProjectIcon />}
        </span>
      </span>
      <span id="demo-header-middle">
        <span id="demo-header-current-level">{getLevelName(currentLevel)}</span>
      </span>
      <span id="demo-header-right">
        <span id="demo-header-level-selection">
          <LevelSelectionBox
            currentLevel={currentLevel}
            numCompletedLevels={numCompletedLevels}
            setNewLevel={setNewLevel}
          />
        </span>
      </span>
    </div>
  );
}

export default DemoHeader;
