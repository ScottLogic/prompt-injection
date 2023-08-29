import { DEFENCE_TYPES, DefenceConfig, DefenceInfo } from "../models/defence";
import { sendRequest } from "./backendService";

const PATH = "defence/";

async function getDefences(phase: number): Promise<DefenceInfo[]> {
  const response = await sendRequest(PATH + "status?phase=" + phase, "GET");
  const data = await response.json();
  console.log("Defence status: ", JSON.stringify(data));
  return data;
}

async function activateDefence(id: string, phase: number): Promise<boolean> {
  const response = await sendRequest(
    PATH + "activate",
    "POST",
    { "Content-Type": "application/json" },
    JSON.stringify({ defenceId: id, phase: phase })
  );
  return response.status === 200;
}

async function deactivateDefence(id: string, phase: number): Promise<boolean> {
  const response = await sendRequest(
    PATH + "deactivate",
    "POST",
    {
      "Content-Type": "application/json",
    },
    JSON.stringify({ defenceId: id, phase: phase })
  );
  return response.status === 200;
}

async function configureDefence(
  id: string,
  config: DefenceConfig[],
  phase: number
): Promise<boolean> {
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
    JSON.stringify({ defenceId: id, config: config, phase: phase })
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

function validateFilterConfig(config: string) {
  // config is not empty or list of empty commas
  const commaPattern = /^,*,*$/;
  return config != "" && !commaPattern.test(config);
}

function validateDefence(id: string, configName: string, config: string) {
  switch (id) {
    case DEFENCE_TYPES.CHARACTER_LIMIT:
      return validateNumberConfig(config);
    case DEFENCE_TYPES.RANDOM_SEQUENCE_ENCLOSURE:
      return configName === "length"
        ? validateNumberConfig(config)
        : validateStringConfig(config);
    case DEFENCE_TYPES.FILTER_USER_INPUT:
      return validateFilterConfig(config);
    case DEFENCE_TYPES.FILTER_BOT_OUTPUT:
      return validateFilterConfig(config);
    default:
      return validateStringConfig(config);
  }
}

async function resetActiveDefences(phase: number) {
  const response = await sendRequest(
    PATH + "reset",
    "POST",
    {
      "Content-Type": "application/json",
    },
    JSON.stringify({ phase: phase })
  );
  return response.status === 200;
}

export {
  getDefences,
  activateDefence,
  deactivateDefence,
  configureDefence,
  resetActiveDefences,
};
