import { sendRequest } from "./backendService";

const PATH = "phase/";

async function getCompletedPhases(): Promise<number> {
  const response = await sendRequest(PATH + "completed", "GET");
  const numCompletedPhases: number = await response.json();
  return numCompletedPhases;
}

export { getCompletedPhases };
