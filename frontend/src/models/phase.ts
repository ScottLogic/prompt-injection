enum PHASE_NAMES {
  PHASE_0 = "phase 0",
  PHASE_1 = "phase 1",
  PHASE_2 = "phase 2",
  SANDBOX = "sandbox",
}

// phase data for the frontend
class Phase {
  constructor(
    name: PHASE_NAMES,
    index: number,
    info: string,
    preamble: string,
    path_to_documents: string,
    isComplete: boolean,
    isCurrent: boolean
  ) {
    this.name = name;
    this.index = index;
    this.info = info;
    this.preamble = preamble;
    this.path_to_documents = path_to_documents;
    this.isCurrent = isCurrent;
    this.isComplete = isComplete;
  }
  name: PHASE_NAMES;
  index: number;
  info: string;
  preamble: string;
  path_to_documents: string;
  isCurrent: boolean;
  isComplete: boolean;
}
export { PHASE_NAMES, Phase };
