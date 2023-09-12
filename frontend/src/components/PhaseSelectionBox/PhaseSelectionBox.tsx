import { Phase, PHASE_NAMES } from "../../models/phase";
import { PHASES } from "../../Phases";

import "./PhaseSelectionBox.css";

function PhaseSelectionBox({
  currentPhase,
  numCompletedPhases,
  setNewPhase,
}: {
  currentPhase: PHASE_NAMES;
  numCompletedPhases: number;
  setNewPhase: (newPhase: number) => void;
}) {
  function handlePhaseChange(newPhase: PHASE_NAMES) {
    if (newPhase !== currentPhase) {
      console.log(`Changing phase to ${newPhase}`);
      setNewPhase(newPhase);
    }
  }

  return (
    <span>
      <div id="phase-selection-box">
        {PHASES.map((phase: Phase, index: number) => {
          return (
            <button
              className={`prompt-injection-button phase-selection-button ${
                phase.id === currentPhase ? "selected" : ""
              }`}
              key={phase.name}
              onClick={() => {
                handlePhaseChange(phase.id);
              }}
              disabled={
                index > numCompletedPhases && phase.id !== PHASE_NAMES.SANDBOX
              }
            >
              {phase.name}
            </button>
          );
        })}
      </div>
    </span>
  );
}

export default PhaseSelectionBox;
