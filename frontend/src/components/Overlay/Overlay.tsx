import { LEVEL_NAMES } from "../../models/level";
import { OVERLAY_TYPE } from "../../models/overlay";
import "./Overlay.css";
import HandbookWelcome from "./OverlayWelcome";
import HandbookOverlay from "../HandbookOverlay/HandbookOverlay";
import MissionInformation from "../Overlay/MissionInformation";

function Overlay({
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
        return <HandbookOverlay currentLevel={currentLevel} />;
      case OVERLAY_TYPE.INFORMATION:
        return <MissionInformation currentLevel={currentLevel} />;
      case OVERLAY_TYPE.WELCOME:
      default:
        return <HandbookWelcome />;
    }
  }

  return (
    <div className="overlay-screen">
      <div className="overlay">
        <button
          className="prompt-injection-min-button close-button"
          onClick={closeOverlay}
          aria-label="close handbook overlay"
        >
          X
        </button>
        <div className="overlay-content">{showOverlayByType()}</div>
      </div>
    </div>
  );
}

export default Overlay;
