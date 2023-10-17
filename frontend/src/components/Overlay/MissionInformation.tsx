import { LEVEL_NAMES } from "../../models/level";
import { LEVELS } from "../../Levels";

import "./MissionInformation.css";

function MissionInformation({ currentLevel }: { currentLevel: LEVEL_NAMES }) {
  return (
    <div>
      <h2> Mission Information </h2>
      <div className="mission-info">
        <p>{LEVELS[currentLevel].missionInfo}</p>
      </div>
    </div>
  );
}

export default MissionInformation;
