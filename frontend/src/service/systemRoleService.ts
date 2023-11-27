import { sendRequest } from "./backendService";

import { LevelSystemRole } from "@src/models/level";

const PATH = "systemRoles/";

// get the system roles for all levels
async function getSystemRoles(): Promise<LevelSystemRole[]> {
  const response = await sendRequest(`${PATH}`, "GET");
  const data = (await response.json()) as LevelSystemRole[];
  return data;
}

export { getSystemRoles };
