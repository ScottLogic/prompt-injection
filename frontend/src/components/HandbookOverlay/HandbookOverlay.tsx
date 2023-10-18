import { useState } from "react";
import { LEVEL_NAMES } from "../../models/level";
import HandbookAttacks from "./HandbookAttacks";
import HandbookOverlayTabs from "./HandbookOverlayTabs";
import { HANDBOOK_PAGES, handbookPageNames } from "../../models/handbook";
import "./HandbookOverlay.css";
import Overlay from "../Overlay/Overlay";

function HandbookOverlay({
  currentLevel,
  closeOverlay,
}: {
  currentLevel: LEVEL_NAMES;
  closeOverlay: () => void;
}) {
  const [selectedPage, setSelectedPage] = useState<HANDBOOK_PAGES>(
    HANDBOOK_PAGES.ATTACKS
  );

  const pageContent = {
    [HANDBOOK_PAGES.ATTACKS]: <HandbookAttacks currentLevel={currentLevel} />,
  }[selectedPage];

  return (
    <Overlay closeOverlay={closeOverlay}>
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
    </Overlay>
  );
}

export default HandbookOverlay;
