import { LEVEL_NAMES } from "../../models/level";
import "./LevelsComplete.css";
import Overlay from "./Overlay";
import LevelsCompleteButtons from "../ThemedButtons/LevelsCompleteButtons";

function LevelsComplete({
  setStartLevel,
  closeOverlay,
}: {
  currentLevel: LEVEL_NAMES;
  setStartLevel: (newLevel: LEVEL_NAMES) => void;
  closeOverlay: () => void;
}) {
  return (
    <Overlay closeOverlay={closeOverlay}>
      <article className="levels-complete-overlay">
        <h1>Congratulations!</h1>
        <div className="dialogue">
          <section>
            <h2>ScottBru Manager: </h2>
            <p>
              Well done!. As our Head of Security, explore ScottBruBots
              different systems and defences and report to its developers for
              feedback. Glad to finally have you in the right role.
            </p>
          </section>
        </div>
        <p>
          You&apos;ve completed the story mode! You can stay here and continue
          to play with the levels, or you can move onto Sandbox mode where you
          can configure your own defence set up and try to break it.
        </p>
        <p>
          You can always go to Sandbox mode by clicking on the button in the
          left panel.
        </p>

        <LevelsCompleteButtons setStartLevel={setStartLevel} />
      </article>
    </Overlay>
  );
}

export default LevelsComplete;
