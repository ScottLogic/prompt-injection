import "./LevelsComplete.css";
import Overlay from "./Overlay";
import LevelsCompleteButtons from "../ThemedButtons/LevelsCompleteButtons";
import MissionDialogue from "./MissionDialogue";

function LevelsComplete({
  goToSandbox,
  closeOverlay,
}: {
  goToSandbox: () => void;
  closeOverlay: () => void;
}) {
  const managerDialogue = [
    {
      speaker: "ScottBru Manager",
      text: "Well done!. As our Head of Security, explore ScottBruBot's different systems and defences and report to its developers for feedback. Glad to finally have you in the right role.",
    },
  ];

  return (
    <Overlay closeOverlay={closeOverlay}>
      <article className="levels-complete-overlay">
        <h1>Congratulations!</h1>
        <div className="content">
          <MissionDialogue dialogueLines={managerDialogue} />
          <p>
            You&apos;ve completed the story mode! You can stay here and continue
            to play with the levels, or you can move onto Sandbox mode where you
            can configure your own defence set up and try to break it.
          </p>
          <p>
            You can always switch modes by clicking on the button in the left
            panel.
          </p>
          <LevelsCompleteButtons
            closeOverlay={closeOverlay}
            goToSandbox={goToSandbox}
          />
        </div>
      </article>
    </Overlay>
  );
}

export default LevelsComplete;
