import { HANDBOOK_PAGES } from "../../models/handbook";
import "./HandbookOverlayTabs.css";

function HandbookOverlayTabs({
  setSelectedPage,
}: {
  setSelectedPage: (page: HANDBOOK_PAGES) => void;
}) {
  // Define an array of tab data
  const tabs = [
    {
      id: "mission-info",
      label: "Mission Info",
      page: HANDBOOK_PAGES.MISSION_INFO,
    },
    { id: "attacks", label: "Attacks", page: HANDBOOK_PAGES.ATTACKS },
    { id: "tools", label: "Tools", page: HANDBOOK_PAGES.TOOLS },
  ];

  return (
    <div className="tabs">
      {tabs.map((tab) => (
        <div key={tab.id}>
          <input
            type="radio"
            name="tabs"
            id={tab.id}
            defaultChecked={tab.page === HANDBOOK_PAGES.MISSION_INFO}
            onClick={() => {
              setSelectedPage(tab.page);
            }}
          />
          <label htmlFor={tab.id}>{tab.label}</label>
        </div>
      ))}
    </div>
  );
}

export default HandbookOverlayTabs;
