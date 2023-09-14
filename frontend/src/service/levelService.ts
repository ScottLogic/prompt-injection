import { sendRequest } from "./backendService";

const PATH = "level/";

async function getCompletedLevels() {
  const response = await sendRequest(`${PATH}completed`, "GET");
  const numCompletedLevels = (await response.json()) as number;
  return numCompletedLevels;
}

export { getCompletedLevels };
