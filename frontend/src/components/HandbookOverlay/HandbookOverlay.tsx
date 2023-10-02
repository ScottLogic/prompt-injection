import { LEVEL_NAMES } from "../../models/level";
import { OVERLAY_TYPE } from "../../models/overlay";
import HandbookAttacks from "./HandbookAttacks";
import HandbookInformation from "./HandbookMissionInfo";
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
      case OVERLAY_TYPE.INFORMATION:
        return <HandbookInformation currentLevel={currentLevel} />;
      case OVERLAY_TYPE.WELCOME:
      default:
        return <HandbookWelcome />;
    }
  }

  return (
    <div className="handbook-overlay-screen">
      <div className="handbook-overlay">
        <button
          className="prompt-injection-min-button close-button"
          onClick={closeOverlay}
          aria-label="close handbook overlay"
        >
          X
        </button>
        <div className="handbook-overlay-content">{showOverlayByType()}</div>
      </div>
    </div>
  );
}

export default HandbookOverlay;
