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
    <div id="handbook-overlay-screen">
      <div id="handbook-overlay">
        <button
          id="close-button"
          className="prompt-injection-min-button"
          onClick={closeOverlay}
        >
          x
        </button>
        <div id="handbook-overlay-content">{showOverlayByType()}</div>
      </div>
    </div>
  );
}

export default HandbookOverlay;
