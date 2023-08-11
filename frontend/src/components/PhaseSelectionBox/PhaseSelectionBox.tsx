import React, { useState, useEffect } from "react";
import { Phase } from "../../models/phase";
import { PHASES } from "../../Phases";
import {
  getCurrentPhase,
  setCurrentPhase,
  setCompletedPhase,
} from "../../service/phaseService";

import "./PhaseSelectionBox.css";

function PhaseSelectionBox(this: any) {
  // start on sandbox mode
  const [currPhase, setCurrPhase] = useState<Phase>(PHASES[3]);

  // valid phases that the user can go to from the current phase
  const [currValidPhases, setCurrValidPhases] = useState<number[]>([0]);

  useEffect(() => {
    const getPhaseInfo = async () => {
      // get current phase from backend on refresh
      const currentPhase = await getCurrentPhase();
      setCurrPhase(currentPhase);
      setCurrValidPhases(getValidPhaseIndexes(currPhase));
    };
    getPhaseInfo();
  }, []);

  const getValidPhaseIndexes = (phase: Phase) => {
    console.log("getting valid phases for: ", JSON.stringify(phase));
    // user can go from sandbox to phase 0 at any time
    if (phase.index === 3) {
      return [0, 3];
      // if current phase is complete, allow user to go to next phase
    } else if (phase.isComplete) {
      return [phase.index + 1, 3];
    }
    // always allow sandbox mode to be chosen
    else return [3];
  };

  const handlePhaseChange = async (index: number) => {
    if (index !== currPhase.index) {
      const newPhase = PHASES[index];
      await setCurrentPhase(newPhase.name);
      setCurrValidPhases(getValidPhaseIndexes(newPhase));
      setCurrPhase(newPhase);
    }
  };

  // if current phase is complete, show the next button as clickable
  // todo: can be used when implementing the win condition
  const handleCompletePhase = async () => {
    await setCompletedPhase(currPhase.name);
    currPhase.isComplete = true;
    setCurrPhase(currPhase);
    setCurrValidPhases(getValidPhaseIndexes(currPhase));
  };

  return (
    <div id="phase-selection-box">
      {PHASES.map((phase: Phase, index: number) => {
        return (
          <button
            className={`phase-selection-button ${
              index === currPhase.index ? "selected" : ""
            }`}
            key={phase.name}
            onClick={() => handlePhaseChange(index)}
            disabled={currValidPhases.indexOf(index) === -1}
          >
            {phase.name}
          </button>
        );
      })}
    </div>
  );
}

export default PhaseSelectionBox;
