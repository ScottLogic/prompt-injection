import { Phase, PHASE_NAMES } from "../../models/phase";
import { PHASES } from "../../Phases";

import "./PhaseSelectionBox.css";

function PhaseSelectionBox(
  this: any,
  {
    currentPhase,
    numCompletedPhases,
    setNewPhase,
  }: {
    currentPhase: PHASE_NAMES;
    numCompletedPhases: number;
    setNewPhase: (newPhase: number) => void;
  }
) {
  const handlePhaseChange = async (index: number) => {
    if (index !== currentPhase) {
      const newPhase = index;
      console.log(`Changing phase to ${newPhase}`);
      setNewPhase(newPhase);
    }
  };

  return (
    <span>
      <div className="side-bar-header">phases</div>
      <div id="phase-selection-box">
        {PHASES.map((phase: Phase, index: number) => {
          return (
            <button
              className={`prompt-injection-button phase-selection-button ${
                index === currentPhase ? "selected" : ""
              }`}
              key={phase.name}
              onClick={() => handlePhaseChange(index)}
              disabled={
                index !== numCompletedPhases && index !== PHASE_NAMES.SANDBOX
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
