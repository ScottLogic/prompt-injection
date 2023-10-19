import { LEVEL_NAMES } from "../../models/level";
import { LEVELS } from "../../Levels";

import "./MissionInformation.css";

function MissionInformation({ currentLevel }: { currentLevel: LEVEL_NAMES }) {
  return (
    <div className="mission-info">
      <h2> Mission Information </h2>
      <div>
        <p>{LEVELS[currentLevel].missionInfoLong}</p>
      </div>
    </div>
  );
}

export default MissionInformation;
