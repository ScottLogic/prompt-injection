import { PHASES } from "../../Phases";
import { PHASE_NAMES } from "../../models/phase";
import PhaseSelectionBox from "../PhaseSelectionBox/PhaseSelectionBox";
import "./DemoHeader.css";

function DemoHeader({
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
    return phaseName || "";
  }

  return (
    <div id="demo-header">
      <span id="demo-header-left">
        <span id="demo-header-title">Prompt Injection Demo</span>
        <span id="demo-header-icon"></span>
      </span>
      <span id="demo-header-middle">
        <span id="demo-header-current-phase">{getPhaseName(currentPhase)}</span>
      </span>
      <span id="demo-header-right">
        <span id="demo-header-phase-selection">
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

export default DemoHeader;
