enum PHASE_NAMES {
  PHASE_0 = "phase 0",
  PHASE_1 = "phase 1",
  PHASE_2 = "phase 2",
  SANDBOX = "sandbox",
}

interface Phase {
  id: PHASE_NAMES;
  name: string;
  preamble: string;
  isCurrent: boolean;
  isComplete: boolean;
}

export { PHASE_NAMES };
export type { Phase };
