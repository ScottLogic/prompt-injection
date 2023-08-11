import { Phase, PHASE_NAMES } from "./models/phase";

const DEFAULT_SANDBOX_PHASE: Phase = new Phase(
  PHASE_NAMES.SANDBOX,
  3,
  "app sandbox. ask the model questions and try get sensitive information",
  "preamble",
  "path_to_documents",
  false,
  true
);

const PHASES: Phase[] = [
  new Phase(
    PHASE_NAMES.PHASE_0,
    0,
    "easy phase to see how to ask the model question and get answers",
    "preamble",
    "path_to_documents",
    false,
    false
  ),
  new Phase(
    PHASE_NAMES.PHASE_1,
    1,
    "harder prompt to try and trick the model into telling you the secret",
    "preamble",
    "path_to_documents",
    false,
    false
  ),
  new Phase(
    PHASE_NAMES.PHASE_2,
    2,
    "even harder and you can use any feature on the app to try and trick the model into telling you the secret",
    "preamble",
    "path_to_documents",
    false,
    false
  ),
  DEFAULT_SANDBOX_PHASE,
];

function getPhaseByName(phaseName: string): Phase {
  return (
    PHASES.find((phase) => phase.name === phaseName) || DEFAULT_SANDBOX_PHASE
  );
}

export { PHASES, getPhaseByName };
