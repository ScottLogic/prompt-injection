import { LEVEL_NAMES } from "../../models/level";
import { LEVELS } from "../../Levels";

import "./MissionInformation.css";
import Overlay from "./Overlay";
import OverlayButton from "../ThemedButtons/OverlayButton";

function MissionInformation({
  currentLevel,
  closeOverlay,
}: {
  currentLevel: LEVEL_NAMES;
  closeOverlay: () => void;
}) {
  return (
    <Overlay closeOverlay={closeOverlay}>
      <div className="mission-info">
        <h2> Mission Information </h2>
        <p>{LEVELS[currentLevel].missionInfoLong}</p>
        <div className="button-area">
          <OverlayButton onClick={closeOverlay}>OK</OverlayButton>
        </div>
      </div>
    </Overlay>
  );
}

export default MissionInformation;
