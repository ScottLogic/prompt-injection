import { DialogueLine } from "@src/models/level";
import "./MissionDialogue.css";

function MissionDialogue({ dialogueLines }: { dialogueLines: DialogueLine[] }) {
  return (
    <div className="mission-dialogue">
      {dialogueLines.map((line, index) => (
        <section key={index}>
          <h2>{`${line.speaker}: `}</h2>
          <p>{`"${line.text}"`}</p>
        </section>
      ))}
    </div>
  );
}

export default MissionDialogue;
