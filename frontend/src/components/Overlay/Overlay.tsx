import { LEVEL_NAMES } from "../../models/level";
import { OVERLAY_TYPE } from "../../models/overlay";
import "./Overlay.css";
import HandbookWelcome from "./OverlayWelcome";
import HandbookOverlay from "../HandbookOverlay/HandbookOverlay";
import MissionInformation from "../Overlay/MissionInformation";
import { useEffect, useRef } from 'react';

function Overlay({
  currentLevel,
  overlayType,
  closeOverlay,
}: {
  currentLevel: LEVEL_NAMES;
  overlayType: OVERLAY_TYPE;
  closeOverlay: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    dialogRef.current?.showModal();
    return () => {
      dialogRef.current?.close();
    }
  }, []);

  const overlayContent =
    overlayType === OVERLAY_TYPE.HANDBOOK
      ? <HandbookOverlay currentLevel={currentLevel} />
      : overlayType === OVERLAY_TYPE.INFORMATION
      ? <MissionInformation currentLevel={currentLevel} />
      : <HandbookWelcome />;

  return (
    <dialog ref={dialogRef} className="overlay">
      <button
        className="prompt-injection-min-button close-button"
        onClick={closeOverlay}
        aria-label="close handbook overlay"
      >
        X
      </button>
      <div className="overlay-content">{overlayContent}</div>
    </dialog>
  );
}

export default Overlay;
