function getPhases() {
  const phases = [
    {
      name: "phase 0",
      index: 0,
      info: "placeholder",
      preamble: "placeholder",
      path_to_documents: "/path/to/folder",
      isCurrent: false,
      isComplete: false,
    },
    {
      name: "phase 1",
      index: 1,
      info: "placeholder",
      preamble: "placeholder",
      path_to_documents: "/path/to/folder",
      isCurrent: false,
      isComplete: false,
    },
    {
      name: "phase 2",
      preamble: "placeholder",
      index: 2,
      info: "placeholder",
      path_to_documents: "/path/to/folder",
      isCurrent: false,
      isComplete: false,
    },
    {
      name: "sandbox",
      index: 3,
      info: "placeholder",
      preamble: "placeholder",
      path_to_documents: "/path/to/folder",
      isCurrent: true,
      isComplete: false,
    },
  ];
  return phases;
}

function getCurrentPhase(session) {
  return session.phases.find((phase) => phase.isCurrent);
}

function switchCurrentPhase(session, phaseName) {
  return session.phases.map((phase) =>
    phase.name === phaseName
      ? { ...phase, isCurrent: true }
      : { ...phase, isCurrent: false }
  );
}

function setPhaseCompleted(session, phaseName) {
  return session.phases.map((phase) =>
    phase.name === phaseName ? { ...phase, isComplete: true } : phase
  );
}

function getCompletedPhases(session) {
  return session.phases.filter((phase) => phase.isComplete);
}

module.exports = {
  getPhases,
  getCurrentPhase,
  switchCurrentPhase,
  setPhaseCompleted,
  getCompletedPhases,
};
