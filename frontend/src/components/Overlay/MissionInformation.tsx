import { LEVELS } from "@src/Levels";
import { LEVEL_NAMES } from "@src/models/level";
import OverlayButton from "@src/components/ThemedButtons/OverlayButton";
import Overlay from "./Overlay";

import "./MissionInformation.css";
import MissionDialogue from "./MissionDialogue";

function MissionInformation({
  currentLevel,
  closeOverlay,
}: {
  currentLevel: LEVEL_NAMES;
  closeOverlay: () => void;
}) {
  return (
    <Overlay closeOverlay={closeOverlay}>
      <div className="mission-information">
        <h1> Mission Information </h1>
        <div className="content">
          <MissionDialogue
            dialogueLines={LEVELS[currentLevel].missionInfoDialogue}
          />
          <div className="button-area">
            <OverlayButton onClick={closeOverlay}>OK</OverlayButton>
          </div>
        </div>
      </div>
    </Overlay>
  );
}

export default MissionInformation;
