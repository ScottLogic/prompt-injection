import { LEVELS } from "../../Levels";
import { LEVEL_NAMES } from "../../models/level";

function ShortMissionInfoButton({
  currentLevel,
  openOverlay,
}: {
  currentLevel: LEVEL_NAMES;
  openOverlay: () => void;
}) {
  return (
    <button className="short-mission-info-button" onClick={openOverlay}>
      {LEVELS[currentLevel].missionInfoShort}
    </button>
  );
}
export default ShortMissionInfoButton;
