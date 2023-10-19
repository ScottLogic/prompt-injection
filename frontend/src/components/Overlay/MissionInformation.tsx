import { LEVEL_NAMES } from "../../models/level";
import { LEVELS } from "../../Levels";

import "./MissionInformation.css";

function MissionInformation({ currentLevel }: { currentLevel: LEVEL_NAMES }) {
  return (
    <div>
      <h1> Mission Information </h1>
      <div id="mission-info">
        <p>{LEVELS[currentLevel].missionInfoLong}</p>
      </div>
    </div>
  );
}

export default MissionInformation;
