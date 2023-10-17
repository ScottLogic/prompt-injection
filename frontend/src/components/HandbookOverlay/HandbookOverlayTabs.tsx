import { HANDBOOK_PAGES, handbookPageNames } from "../../models/handbook";
import { LEVEL_NAMES } from "../../models/level";
import "./HandbookOverlayTabs.css";

function HandbookOverlayTabs({
  currentPage,
  selectPage,
}: {
  currentLevel: LEVEL_NAMES;
  currentPage: HANDBOOK_PAGES;
  selectPage: (page: HANDBOOK_PAGES) => void;
}) {
  // the tabs that are shown depend on the current level
  const tabs = [ HANDBOOK_PAGES.ATTACKS];

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
