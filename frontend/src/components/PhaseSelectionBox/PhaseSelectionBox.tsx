import React, { useState, useEffect } from "react";
import { Phase } from "../../models/phase";
import { PHASES } from "../../Phases";
import {
  getCurrentPhaseBack,
  setCurrentPhaseBack,
  getCompletedPhasesBack,
} from "../../service/phaseService";

import "./PhaseSelectionBox.css";

function PhaseSelectionBox(this: any) {
  const [currPhaseIndex, setCurrPhaseIndex] = useState<number>(3); // begin sandbox
  const [currPhase, setCurrPhase] = useState<Phase>(PHASES[3]);

  const [currValidPhases, setCurrValidPhases] = useState<number[]>([0]);

  const [completePhases, setCompletePhases] = useState<Phase[]>([]);

  useEffect(() => {
    const getPhaseInfo = async () => {
      // get current phase from backend on refresh
      const currentPhase = await getCurrentPhaseBack();
      setCurrPhase(currentPhase);

      console.log("current Phase Index: ", currentPhase.index);
      setCurrPhaseIndex(currentPhase.index);

      setCurrValidPhases(getValidPhaseIndexes(currPhaseIndex));
      console.log("valid phase index: ", currValidPhases);

      const completedPhases = await getCompletedPhasesBack();
      setCompletePhases(completedPhases);
      console.log("completed phases: ", completePhases);
    };
    getPhaseInfo();
  }, []);

  const getValidPhaseIndexes = (index: number) => {
    // user can go from sandbox to phase 0 at any time
    if (index === 3) {
      return [0, 3];
      // if current phase is complte, allow user to go to next phase
    } else if (currPhase.isComplete) {
      return [index + 1, 3];
    }
    // always allow sandbox mode to be chosen
    else return [index, 3];
  };

  const handlePhaseChange = async (index: number) => {
    if (index !== currPhaseIndex) {
      await setCurrentPhaseBack(PHASES[index].name);

      setCurrPhaseIndex(index);
      setCurrValidPhases(getValidPhaseIndexes(index));

      setCurrPhase(PHASES[index]);

      console.log(`Changing phase to: ${PHASES[index].name}`);
    }
  };

  return (
    <div id="phase-selection-box">
      {PHASES.map((phase: Phase, index: number) => {
        return (
          <button
            className={`phase-selection-button ${
              index === currPhaseIndex ? "selected" : ""
            }`}
            key={phase.name}
            onClick={() => handlePhaseChange(index)}
            disabled={currValidPhases.indexOf(index) === -1}
            style={{
              backgroundColor: index === currPhaseIndex ? "pink" : "initial",
            }}
          >
            {phase.name}
          </button>
        );
      })}
    </div>
  );
}

export default PhaseSelectionBox;
