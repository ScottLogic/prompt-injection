import { LEVEL_NAMES } from "../../models/level";
import { LEVELS } from "../../Levels";

import "./MissionInformation.css";

function MissionInformation({ currentLevel }: { currentLevel: LEVEL_NAMES }) {
  return (
    <div className="mission-info">
      <h1> Mission Information </h1>
      <p>{LEVELS[currentLevel].missionInfoLong}</p>
    </div>
  );
}

export default MissionInformation;
