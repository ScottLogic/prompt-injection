enum PHASE_NAMES {
  PHASE_0 = 0,
  PHASE_1,
  PHASE_2,
  SANDBOX,
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
