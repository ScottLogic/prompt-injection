import { HANDBOOK_PAGES, handbookPageNames } from "../../models/handbook";
import { LEVEL_NAMES } from "../../models/level";
import "./HandbookOverlayTabs.css";

function HandbookOverlayTabs({
  currentLevel,
  setSelectedPage,
}: {
  currentLevel: LEVEL_NAMES;
  setSelectedPage: (page: HANDBOOK_PAGES) => void;
}) {
  // the tabs that are shown depend on the current level
  function getLevelTabs(currentLevel: LEVEL_NAMES) {
    switch (currentLevel) {
      case LEVEL_NAMES.LEVEL_1:
        return [HANDBOOK_PAGES.MISSION_INFO];
      default:
        return [
          HANDBOOK_PAGES.MISSION_INFO,
          HANDBOOK_PAGES.ATTACKS,
          HANDBOOK_PAGES.TOOLS,
        ];
    }
  }

  return (
    <div className="handbook-tabs">
      {getLevelTabs(currentLevel).map((tab) => (
        <div key={tab}>
          <input
            type="radio"
            name="handbook-tabs"
            id={tab.toString()}
            defaultChecked={tab === HANDBOOK_PAGES.MISSION_INFO}
            onClick={() => {
              setSelectedPage(tab);
            }}
          />
          <label htmlFor={tab.toString()}>{handbookPageNames[tab]}</label>
        </div>
      ))}
    </div>
  );
}

export default HandbookOverlayTabs;
