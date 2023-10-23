import { LEVEL_NAMES } from "../../models/level";
import { LEVELS } from "../../Levels";

import "./MissionInformation.css";

function MissionInformation({ currentLevel }: { currentLevel: LEVEL_NAMES }) {
  return (
    <div className="mission-information">
      <h1> Mission Information </h1>
      <div className="dialogue">
        {LEVELS[currentLevel].missionInfoDialogue.map((line, index) => (
          <section key={index}>
            <p className="dialogue-speaker">{`${line.speaker}: `}</p>
            <p className="dialogue-text">{line.text}</p>
          </section>
        ))}
      </div>
    </div>
  );
}

export default MissionInformation;
