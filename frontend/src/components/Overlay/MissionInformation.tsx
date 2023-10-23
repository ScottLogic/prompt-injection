import { useRef } from "react";
import { LEVELS } from "../../Levels";
import { LEVEL_NAMES } from "../../models/level";
import OverlayButton from "../ThemedButtons/OverlayButton";
import Overlay, { DialogClose } from "./Overlay";

import "./MissionInformation.css";

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
      <div className="mission-info">
        <h2> Mission Information </h2>
        <p>{LEVELS[currentLevel].missionInfoLong}</p>
        <div className="button-area">
          <OverlayButton onClick={closeMissionInfo}>OK</OverlayButton>
        </div>
      </div>
    </Overlay>
  );
}

export default MissionInformation;
