import { useState } from "react";
import { LEVEL_NAMES } from "../../models/level";
import { OVERLAY_TYPE } from "../../models/overlay";
import HandbookAttacks from "./HandbookAttacks";
import HandbookInformation from "./HandbookMissionInfo";
import "./HandbookOverlay.css";
import HandbookOverlayTabs from "./HandbookOverlayTabs";
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
  const [currentTab, setCurrentTab] = useState<OVERLAY_TYPE>(overlayType);

  const toggleTab = (tab: OVERLAY_TYPE) => {
    console.log("toggling tab", tab);
    setCurrentTab(tab);
    showOverlayByType();
  };

  function showOverlayByType(overlayType: OVERLAY_TYPE = currentTab) {
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
        <div className="handbook-overlay-header">
          <HandbookOverlayTabs toggleTab={toggleTab} />
          <button
            className="prompt-injection-min-button close-button"
            onClick={closeOverlay}
            aria-label="close handbook overlay"
          >
            X
          </button>
        </div>
        <div className="handbook-overlay-content">{showOverlayByType()}</div>
      </div>
    </div>
  );
}

export default HandbookOverlay;
