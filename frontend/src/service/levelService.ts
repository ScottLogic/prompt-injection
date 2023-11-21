import { LevelSystemRole } from "@src/models/level";
import { sendRequest } from "./backendService";

const PATH = "systemroles/";

// get the system roles for all levels - GET 
async function getSystemRoles(): Promise<LevelSystemRole[]> {
  const response = await sendRequest(`${PATH}`, "GET");
  const data = (await response.json()) as LevelSystemRole[];
  return data;
}

export { getSystemRoles };
