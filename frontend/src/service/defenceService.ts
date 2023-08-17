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
  const validation = config.map((c) => validateDefence(id, c.name, c.value));
  if (validation.includes(false)) {
    console.log("Invalid value for defence configuration", id, config);
    return false;
  }
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

function validateNumberConfig(config: string) {
  // config is a number greater than zero
  return !isNaN(Number(config)) && Number(config) > 0;
}

function validateStringConfig(config: string) {
  // config is non empty string and is not a number
  return config != "" && !Number(config);
}

function validateDefence(id: string, configName: string, config: string) {
  switch (id) {
    case "CHARACTER_LIMIT":
      return validateNumberConfig(config);
    case "RANDOM_SEQUENCE_ENCLOSURE":
      return configName === "length"
        ? validateNumberConfig(config)
        : validateStringConfig(config);
    default:
      return validateStringConfig(config);
  }
}

export { getDefences, activateDefence, deactivateDefence, configureDefence };
