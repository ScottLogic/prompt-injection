import "./HandbookSpine.css";

import { HANDBOOK_PAGES, handbookPageNames } from "@src/models/handbook";
import { LEVEL_NAMES } from "@src/models/level";

function HandbookSpine({
  currentLevel,
  currentPage,
  selectPage,
}: {
  currentLevel: LEVEL_NAMES;
  currentPage: HANDBOOK_PAGES;
  selectPage: (page: HANDBOOK_PAGES) => void;
}) {
  // the tabs that are shown depend on the current level (only show system role in leves 2 & 3)
  const tabs =
    currentLevel > LEVEL_NAMES.LEVEL_1 && currentLevel < LEVEL_NAMES.SANDBOX
      ? [
          HANDBOOK_PAGES.ATTACKS,
          HANDBOOK_PAGES.SYSTEM_ROLE,
          HANDBOOK_PAGES.GLOSSARY,
        ]
      : [HANDBOOK_PAGES.ATTACKS, HANDBOOK_PAGES.GLOSSARY];

  return (
    <div className="handbook-spine" role="tablist">
      {tabs.map((page) => (
        <button
          key={page}
          id={`handbook-tab-${page}`}
          role="tab"
          aria-controls={`handbook-page-${page}`}
          aria-selected={page === currentPage}
          onClick={() => {
            selectPage(page);
          }}
        >
          {handbookPageNames[page]}
        </button>
      ))}
    </div>
  );
}

export default HandbookSpine;
