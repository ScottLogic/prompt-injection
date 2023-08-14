import { useState, useEffect } from "react";
import { Phase } from "../../models/phase";
import { PHASES } from "../../Phases";

import "./PhaseSelectionBox.css";
import { getCompletedPhases } from "../../service/phaseService";

function PhaseSelectionBox(
  this: any,
  {
    currentPhase,
    numCompletedPhases,
    setCurrentPhase,
  }: {
    currentPhase: number;
    numCompletedPhases: number;
    setCurrentPhase: (newPhase: number) => void;
  }
) {
  const handlePhaseChange = async (index: number) => {
    if (index !== currentPhase) {
      const newPhase = index;
      console.log(`Changing phase to ${newPhase}`);
      setCurrentPhase(newPhase);
    }
  };

  return (
    <span>
      <div className="side-bar-header">phases</div>
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
    </span>
  );
}

export default PhaseSelectionBox;
