import { useState } from "react";
import { LEVEL_NAMES } from "../../models/level";
import MissionInformation from "../Overlay/MissionInformation";
import HandbookAttacks from "./HandbookAttacks";
import HandbookOverlayTabs from "./HandbookOverlayTabs";
import { HANDBOOK_PAGES, handbookPageNames } from "../../models/handbook";
import "./HandbookOverlay.css";

function HandbookOverlay({ currentLevel }: { currentLevel: LEVEL_NAMES }) {
  const [selectedPage, setSelectedPage] = useState<HANDBOOK_PAGES>(
    HANDBOOK_PAGES.MISSION_INFO
  );

  const pageContent = {
    [HANDBOOK_PAGES.MISSION_INFO]: (
      <MissionInformation currentLevel={currentLevel} />
    ),
    [HANDBOOK_PAGES.ATTACKS]: <HandbookAttacks currentLevel={currentLevel} />,
  }[selectedPage];

  return (
    <div className="handbook-overlay">
      <HandbookOverlayTabs
        currentLevel={currentLevel}
        currentPage={selectedPage}
        selectPage={setSelectedPage}
      />
      <div
        className="content"
        role="tabpanel"
        aria-label={handbookPageNames[selectedPage]}
      >
        {pageContent}
      </div>
    </div>
  );
}

export default HandbookOverlay;
