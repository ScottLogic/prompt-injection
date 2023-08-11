import { sendRequest } from "./backendService";
import { Phase } from "../models/phase";
import { getPhaseByName } from "../Phases";

const PATH = "phase/";

const getCurrentPhaseBack = async (): Promise<Phase> => {
  const repsonse = await sendRequest(PATH + "current", "GET");
  const phaseName = await repsonse.json();
  // get the phase object that matches the name
  return getPhaseByName(phaseName.name);
};

const setCurrentPhaseBack = async (phase: string) => {
  const response = await sendRequest(
    PATH + "current",
    "POST",
    { "Content-Type": "application/json" },
    JSON.stringify({ phase: phase })
  );
  console.log("response", response);
};

const getCompletedPhasesBack = async (): Promise<Phase[]> => {
  const response = await sendRequest(PATH + "completed", "GET");
  const phaseList: Phase[] = await response.json();
  const phaseNames: string[] = phaseList.map((phase: Phase) => phase.name);
  return phaseNames.map((phaseName: string) => getPhaseByName(phaseName));
};

export { getCurrentPhaseBack, setCurrentPhaseBack, getCompletedPhasesBack };
