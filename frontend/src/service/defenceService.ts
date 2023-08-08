import { DefenceConfig, DefenceInfo } from "../models/defence";
import { sendRequest } from "./backendService";

const PATH = "defence/";

async function getDefences(): Promise<DefenceInfo[]> {
  const response = await sendRequest(PATH + "status", "GET");
  const data = await response.json();
  return data;
}

async function activateDefence(id: string): Promise<boolean> {
  const response = await sendRequest(
    PATH + "activate",
    "POST",
    { "Content-Type": "application/json" },
    JSON.stringify({ defenceId: id })
  );
  return response.status === 200;
}

async function deactivateDefence(id: string): Promise<boolean> {
  const response = await sendRequest(
    PATH + "deactivate",
    "POST",
    {
      "Content-Type": "application/json",
    },
    JSON.stringify({ defenceId: id })
  );
  return response.status === 200;
}

async function configureDefence(id: string, config: DefenceConfig[]) {
  const response = await sendRequest(
    PATH + "configure",
    "POST",
    {
      "Content-Type": "application/json",
    },
    JSON.stringify({ defenceId: id, config: config })
  );
  return response.status === 200;
}

export { getDefences, activateDefence, deactivateDefence, configureDefence };
