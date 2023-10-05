import { HANDBOOK_PAGES } from "../../models/handbook";
import "./HandbookOverlayTabs.css";

function HandbookOverlayTabs({
  setSelectedPage,
}: {
  setSelectedPage: (page: HANDBOOK_PAGES) => void;
}) {
  const tabs = [
    { id: HANDBOOK_PAGES.MISSION_INFO, label: "Mission Info" },
    { id: HANDBOOK_PAGES.ATTACKS, label: "Attacks" },
    { id: HANDBOOK_PAGES.TOOLS, label: "Tools" },
  ];

  return (
    <div className="handbook-tabs">
      {tabs.map((tab) => (
        <div key={tab.id}>
          <input
            type="radio"
            name="handbook-tabs"
            id={tab.id.toString()}
            defaultChecked={tab.id === HANDBOOK_PAGES.MISSION_INFO}
            onClick={() => {
              setSelectedPage(tab.id);
            }}
          />
          <label htmlFor={tab.id.toString()}>{tab.label}</label>
        </div>
      ))}
    </div>
  );
}

export default HandbookOverlayTabs;
