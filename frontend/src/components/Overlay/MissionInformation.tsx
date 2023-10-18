import { LEVEL_NAMES } from "../../models/level";
import { LEVELS } from "../../Levels";

import "./MissionInformation.css";
import Overlay from "./Overlay";

function MissionInformation({
  currentLevel,
  closeOverlay,
}: {
  currentLevel: LEVEL_NAMES;
  closeOverlay: () => void;
}) {
  return (
    <Overlay closeOverlay={closeOverlay}>
      <div className="mission-info-page">
        <h2> Mission Information </h2>
        <div id="mission-info">
          <p>{LEVELS[currentLevel].missionInfoLong}</p>
        </div>
      </div>
    </Overlay>
  );
}

export default MissionInformation;
