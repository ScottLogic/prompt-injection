import { sendRequest } from "./backendService";

const PATH = "phase/";

async function getCompletedPhases() {
  const response = await sendRequest(`${PATH}completed`, "GET");
  const numCompletedPhases = (await response.json()) as number;
  return numCompletedPhases;
}

export { getCompletedPhases };
