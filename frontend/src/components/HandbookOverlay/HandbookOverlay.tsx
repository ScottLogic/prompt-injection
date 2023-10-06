/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
// The above eslint rules are disabled to allow the user to click outside of the dialog to close it.
// Keyboard users are able to close the dialog by pressing the escape key, or tabbing to the close icon.

import { LEVEL_NAMES } from "../../models/level";
import { OVERLAY_TYPE } from "../../models/overlay";
import HandbookAttacks from "./HandbookAttacks";
import "./HandbookOverlay.css";
import HandbookWelcome from "./HandbookWelcome";

function HandbookOverlay({
  currentLevel,
  overlayType,
  closeOverlay,
}: {
  currentLevel: LEVEL_NAMES;
  overlayType: OVERLAY_TYPE;
  closeOverlay: () => void;
}) {
  function showOverlayByType() {
    switch (overlayType) {
      case OVERLAY_TYPE.HANDBOOK:
        return <HandbookAttacks currentLevel={currentLevel} />;
      case OVERLAY_TYPE.WELCOME:
      default:
        return <HandbookWelcome />;
    }
  }

  return (
    <dialog className="handbook-overlay" onClick={closeOverlay}>
      <button
        className="prompt-injection-min-button close-button"
        onClick={closeOverlay}
        aria-label="close handbook overlay"
      >
        X
      </button>
      <div
        className="handbook-overlay-content"
        onClick={(event) => {
          event.stopPropagation();
        }}
      >
        {showOverlayByType()}
      </div>
    </dialog>
  );
}

export default HandbookOverlay;
