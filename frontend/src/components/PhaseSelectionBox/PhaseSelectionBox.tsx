import { useState, useEffect } from "react";
import { Phase } from "../../models/phase";
import { PHASES } from "../../Phases";

import "./PhaseSelectionBox.css";

function PhaseSelectionBox(
  this: any,
  {
    currentPhase,
    numCompletedPhases,
    setNewPhase,
  }: {
    currentPhase: number;
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
    <div id="phase-selection-box">
      {PHASES.map((phase: Phase, index: number) => {
        return (
          <button
            className={`phase-selection-button ${
              index === currentPhase ? "selected" : ""
            }`}
            key={phase.name}
            onClick={() => handlePhaseChange(index)}
            disabled={index !== numCompletedPhases && index !== 3}
          >
            {phase.name}
          </button>
        );
      })}
    </div>
  );
}

export default PhaseSelectionBox;
