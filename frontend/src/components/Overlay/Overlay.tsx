import { useCallback, useEffect, useRef } from "react";
import { LEVEL_NAMES } from "../../models/level";
import { OVERLAY_TYPE } from "../../models/overlay";
import HandbookOverlay from "../HandbookOverlay/HandbookOverlay";
import MissionInformation from "./MissionInformation";
import HandbookWelcome from "./OverlayWelcome";

import "./Overlay.css";

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
  const contentRef = useRef<HTMLDivElement>(null);

  const handleOverlayClick = useCallback(
    (event: MouseEvent) => {
      contentRef.current &&
        !event.composedPath().includes(contentRef.current) &&
        closeOverlay();
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
    dialogRef.current?.showModal();
    return () => {
      dialogRef.current?.close();
    };
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleEscape);
    setTimeout(() => {
      // Need timeout, else dialog consumes same click that
      // opened it and closes immediately!
      window.addEventListener("click", handleOverlayClick);
    });

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
      <HandbookWelcome />
    );

  function handleClose() {
    dialogRef.current?.close();
    closeOverlay();
  }

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
