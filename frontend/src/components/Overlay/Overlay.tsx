import { useCallback, useEffect, useRef } from "react";
import { LEVEL_NAMES } from "../../models/level";
import { OVERLAY_TYPE } from "../../models/overlay";
import HandbookOverlay from "../HandbookOverlay/HandbookOverlay";
import MissionInformation from "./MissionInformation";
import OverlayWelcome from "./OverlayWelcome";

import "./Overlay.css";

function Overlay({
  currentLevel,
  overlayType,
  setStartLevel,
  closeOverlay,
}: {
  currentLevel: LEVEL_NAMES;
  overlayType: OVERLAY_TYPE | null;
  setStartLevel: (startLevel: LEVEL_NAMES) => void;
  closeOverlay: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  function handleClose() {
    // close the dialog element first to give focus back to the last focused element
    dialogRef.current?.close();
    closeOverlay();
  }

  const handleOverlayClick = useCallback(
    (event: MouseEvent) => {
      contentRef.current &&
        !event.composedPath().includes(contentRef.current) &&
        handleClose();
    },
    [closeOverlay, contentRef]
  );

  const handleEscape = useCallback(
    (event: KeyboardEvent) => {
      event.code === "Escape" && handleClose();
    },
    [closeOverlay]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleEscape);
    setTimeout(() => {
      // Need timeout, else dialog consumes same click that
      // opened it and closes immediately!
      window.addEventListener("click", handleOverlayClick);
    });

    if (overlayType === null) {
      // null overlay type indicates we should not have an overlay
      dialogRef.current?.close();
    } else {
      dialogRef.current?.showModal();
    }

    return () => {
      window.removeEventListener("keydown", handleEscape);
      window.removeEventListener("click", handleOverlayClick);
    };
  }, [overlayType]);

  const overlayContent =
    overlayType === OVERLAY_TYPE.HANDBOOK ? (
      <HandbookOverlay currentLevel={currentLevel} />
    ) : overlayType === OVERLAY_TYPE.INFORMATION ? (
      <MissionInformation currentLevel={currentLevel} />
    ) : (
      <OverlayWelcome
        currentLevel={currentLevel}
        setStartLevel={setStartLevel}
      />
    );

  return (
    <dialog ref={dialogRef} className="overlay">
      <button
        className="prompt-injection-min-button close-button"
        onClick={handleClose}
        aria-label="close handbook overlay"
      >
        X
      </button>
      <div ref={contentRef} className="overlay-content">
        {overlayContent}
      </div>
    </dialog>
  );
}

export default Overlay;
