import { useState, useEffect } from "react";
import { Phase } from "../../models/phase";
import { PHASES } from "../../Phases";

import "./PhaseSelectionBox.css";
import { getCompletedPhases } from "../../service/phaseService";

function PhaseSelectionBox(this: any) {
  // start on sandbox mode
  const [currentPhase, setCurrentPhase] = useState<number>(0);
  const [numCompletedPhases, setNumCompletedPhases] = useState<number>(0);

  // called on mount
  useEffect(() => {
    getCompletedPhases().then((numCompletedPhases) => {
      setNumCompletedPhases(numCompletedPhases);
    });
  }, []);

  const handlePhaseChange = async (index: number) => {
    if (index !== currentPhase) {
      const newPhase = index;
      console.log(`Changing phase to ${newPhase}`);
      setCurrentPhase(newPhase);
    }
  };

  return (
    <div id="phase-selection-box">
      {PHASES.map((phase: Phase, index: number) => {
        return (
          <button
            className={`phase-selection-button ${
              index === currentPhase ? "selected" : ""
            }`}
            key={phase.name}
            onClick={() => handlePhaseChange(index)}
            disabled={index > numCompletedPhases && index !== 3}
          >
            {phase.name}
          </button>
        );
      })}
    </div>
  );
}

export default PhaseSelectionBox;
