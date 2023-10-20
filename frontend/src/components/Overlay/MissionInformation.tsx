import { LEVEL_NAMES } from "../../models/level";
import { LEVELS } from "../../Levels";

import "./MissionInformation.css";

function MissionInformation({ currentLevel }: { currentLevel: LEVEL_NAMES }) {
  return (
    <div>
      <h1> Mission Information </h1>

        {LEVELS[currentLevel].missionInfoDialogue.map((line, index) => (
          <section key={index}>
            <h3 className="dialogue-speaker">{`${line.speaker}: `}</h3>
            <p className="dialogue-text">{line.text}</p>
          </section>
        ))}
    </div>
  );
}

export default MissionInformation;
