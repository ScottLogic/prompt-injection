import { useRef } from "react";
import { LEVELS } from "../../Levels";
import { LEVEL_NAMES } from "../../models/level";
import OverlayButton from "../ThemedButtons/OverlayButton";
import Overlay, { DialogClose } from "./Overlay";

import "./MissionInformation.css";
import MissionDialogue from "./MissionDialogue";

function MissionInformation({
  currentLevel,
  closeOverlay,
}: {
  currentLevel: LEVEL_NAMES;
  closeOverlay: () => void;
}) {
  const dialogRef = useRef<DialogClose>(null);

  function closeMissionInfo() {
    dialogRef.current?.close();
    closeOverlay();
  }

  return (
    <Overlay ref={dialogRef} closeOverlay={closeOverlay}>
      <div className="mission-information">
        <h1> Mission Information </h1>
        <div className="content">
          <MissionDialogue
            dialogueLines={LEVELS[currentLevel].missionInfoDialogue}
          />
          <div className="button-area">
            <OverlayButton onClick={closeMissionInfo}>OK</OverlayButton>
          </div>
        </div>
      </div>
    </Overlay>
  );
}

export default MissionInformation;
