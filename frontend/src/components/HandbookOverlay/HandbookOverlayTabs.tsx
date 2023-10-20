import { HANDBOOK_PAGES, handbookPageNames } from "../../models/handbook";
import { LEVEL_NAMES } from "../../models/level";
import "./HandbookOverlayTabs.css";

function HandbookOverlayTabs({
  currentLevel,
  currentPage,
  selectPage,
}: {
  currentLevel: LEVEL_NAMES;
  currentPage: HANDBOOK_PAGES;
  selectPage: (page: HANDBOOK_PAGES) => void;
}) {
  // the tabs that are shown depend on the current level
  const tabs =
    currentLevel === LEVEL_NAMES.LEVEL_1
      ? [HANDBOOK_PAGES.GLOSSARY]
      : [HANDBOOK_PAGES.GLOSSARY, HANDBOOK_PAGES.ATTACKS];

  return (
    <div className="handbook-tabs" role="tablist">
      {tabs.map((page) => (
        <button
          key={page}
          role="tab"
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

export default HandbookOverlayTabs;
