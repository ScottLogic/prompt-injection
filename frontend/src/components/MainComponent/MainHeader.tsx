import { PHASES } from "../../Phases";
import { PHASE_NAMES } from "../../models/phase";
import PhaseSelectionBox from "../PhaseSelectionBox/PhaseSelectionBox";
import "./MainHeader.css";
import ProjectIcon from "./ProjectIcon";
import ProjectIconWon from "./ProjectIconWon";

function MainHeader({
  currentPhase,
  numCompletedPhases,
  setNewPhase,
}: {
  currentPhase: PHASE_NAMES;
  numCompletedPhases: number;
  setNewPhase: (newPhase: number) => void;
}) {
  function getPhaseName(phase: PHASE_NAMES) {
    const phaseName = PHASES.find((p) => p.id === phase)?.name;
    return phaseName ?? "";
  }

  const isPhaseComplete = (currentPhase as number) < numCompletedPhases;

  return (
    <div id="main-header">
      <span id="main-header-left">
        <span id="main-header-title">Prompt Injection Demo</span>
        <span id="main-header-icon">
          {isPhaseComplete ? <ProjectIconWon /> : <ProjectIcon />}
        </span>
      </span>
      <span id="main-header-middle">
        <span id="main-header-current-phase">{getPhaseName(currentPhase)}</span>
      </span>
      <span id="main-header-right">
        <span id="main-header-phase-selection">
          <PhaseSelectionBox
            currentPhase={currentPhase}
            numCompletedPhases={numCompletedPhases}
            setNewPhase={setNewPhase}
          />
        </span>
      </span>
    </div>
  );
}

export default MainHeader;
