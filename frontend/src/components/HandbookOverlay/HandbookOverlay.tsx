import { useRef, useState } from "react";

import HandbookAttacks from "./HandbookAttacks";
import HandbookCloseIcon from "./HandbookCloseIcon";
import HandbookGlossary from "./HandbookGlossary";
import "./HandbookOverlay.css";
import HandbookSpine from "./HandbookSpine";
import HandbookSystemRole from "./HandbookSystemRole";

import useIsOverflow from "@src/hooks/useIsOverflow";
import { HANDBOOK_PAGES } from "@src/models/handbook";
import { LEVEL_NAMES, LevelSystemRole } from "@src/models/level";

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

  // hooks to control tabIndex when there is scrolling
  const handBookPageContainer = useRef<HTMLDivElement>(null);
  const isOverflow = useIsOverflow(handBookPageContainer);

  const systemRoles: LevelSystemRole[] = [
    {level:0, systemRole: "system role level 1"},
    {level:1, systemRole: "system role level 2"},
    {level:2, systemRole: "system role level 3"},
  ];

  const pageContent = {
    [HANDBOOK_PAGES.ATTACKS]: <HandbookAttacks currentLevel={currentLevel} />,
    [HANDBOOK_PAGES.GLOSSARY]: <HandbookGlossary />,
    [HANDBOOK_PAGES.SYSTEM_ROLE]: (
      <HandbookSystemRole level={currentLevel} systemRoles={systemRoles} beatCurrentLevel={false} />
    ),
  }[selectedPage];

  return (
    <div className="handbook-overlay">
      <button
        className="prompt-injection-min-button close-button"
        title="close the handbook"
        aria-label="close the handbook"
        onClick={closeOverlay}
      >
        <HandbookCloseIcon />
      </button>
      <HandbookSpine
        currentLevel={currentLevel}
        currentPage={selectedPage}
        selectPage={setSelectedPage}
      />
      <div
        id={`handbook-page-${selectedPage}`}
        className="content"
        role="tabpanel"
        ref={handBookPageContainer}
        tabIndex={isOverflow ? 0 : undefined}
        aria-labelledby={`handbook-tab-${selectedPage}`}
      >
        {pageContent}
      </div>
    </div>
  );
}

export default HandbookOverlay;
