import { useState } from "react";

import "./HandbookOverlayTabs.css";
import { OVERLAY_TYPE } from "../../models/overlay";

function HandbookOverlayTabs({
  toggleTab,
}: {
  toggleTab: (tab: OVERLAY_TYPE) => void;
}) {
  return (
    <div>
      <div className="handbook-tabs">
        <div
          className="tabs open"
          onClick={() => {
            toggleTab(OVERLAY_TYPE.INFORMATION);
          }}
        >
          Mission Info
        </div>
        <div
          className="tabs"
          onClick={() => {
            toggleTab(OVERLAY_TYPE.INFORMATION);
          }}
        >
          Attacks
        </div>
        <div className="tabs">Tab 3</div>
      </div>
    </div>
  );
}

export default HandbookOverlayTabs;
