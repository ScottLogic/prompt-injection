import { LevelSystemRole } from "@src/models/level";
import { sendRequest } from "./backendService";

const PATH = "level/";

// get the prompt/system role for a level - TODO: REMOVE
async function getLevelPrompt(level: number) {
  const response = await sendRequest(`${PATH}prompt?level=${level}`, "GET");
  const data = await response.text();
  return data;
}

// get the system roles for all levels - TODO move this
async function getSystemRoles(): Promise<LevelSystemRole[]> {
  const response = await sendRequest(`${PATH}systemroles`, "GET");
  const data = (await response.json()) as LevelSystemRole[];
  return data;
}

export { getLevelPrompt, getSystemRoles };
