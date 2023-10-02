import { LEVEL_NAMES } from "../../models/level";
import { LEVELS } from "../../Levels";

import "./HandbookMissionInfo.css";

function HandbookMissionInfo({ currentLevel }: { currentLevel: LEVEL_NAMES }) {
  return (
    <div>
      <h2> Information </h2>
      <div id="handbook-mission-info">
        <p>{LEVELS[currentLevel].missionInfo}</p>
      </div>
    </div>
  );
}

export default HandbookMissionInfo;
