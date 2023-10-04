import { useState } from "react";
import { LEVEL_NAMES } from "../../models/level";
import MissionInformation from "../Overlay/MissionInformation";
import HandbookAttacks from "./HandbookAttacks";
import HandbookOverlayTabs from "./HandbookOverlayTabs";
import { HANDBOOK_PAGES } from "../../models/handbook";

function HandbookOverlay({
  currentLevel,
  closeOverlay,
}: {
  currentLevel: LEVEL_NAMES;
  closeOverlay: () => void;
}) {
  const [selectedPage, setSelectedPage] = useState<HANDBOOK_PAGES>(
    HANDBOOK_PAGES.INFORMATION
  );

  function setPageContent(handbookPage: HANDBOOK_PAGES) {
    switch (handbookPage) {
      case HANDBOOK_PAGES.ATTACKS:
        return <HandbookAttacks currentLevel={currentLevel} />;
      case HANDBOOK_PAGES.INFORMATION:
      default:
        return <MissionInformation currentLevel={currentLevel} />;
    }
  }

  return (
    <div className="handbook-overlay">
      <HandbookOverlayTabs setSelectedPage={setSelectedPage} />
      <div className="handbook-overlay-content">
        {setPageContent(selectedPage)}
      </div>
    </div>
  );
}

export default HandbookOverlay;
