import { sendRequest } from "./backendService";

const PATH = "level/";

async function getCompletedLevels() {
  const response = await sendRequest(`${PATH}completed`, "GET");
  const numCompletedLevels = (await response.json()) as number;
  return numCompletedLevels;
}

// get the prompt/system role for a level
async function getLevelPrompt(level: number) {
  const response = await sendRequest(`${PATH}prompt?level=${level}`, "GET");
  const data = await response.text();
  return data;
}

export { getCompletedLevels, getLevelPrompt };
