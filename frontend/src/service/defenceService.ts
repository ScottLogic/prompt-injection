import { sendRequest } from "./backendService";

const PATH = "defence/";

interface OpenAIDefence {
  name: string;
  type: string;
  info: string;
  isActive?: boolean;
  isTriggered?: boolean;
}

enum DEFENCE_TYPES {
  CHARACTER_LIMIT = "CHARACTER_LIMIT",
  RANDOM_SEQUENCE_ENCLOSURE = "RANDOM_SEQUENCE_ENCLOSURE",
  SYSTEM_ROLE = "SYSTEM_ROLE",
  XML_TAGGING = "XML_TAGGING",
  EMAIL_WHITELIST = "EMAIL_WHITELIST",
}

enum DEFENCE_NAMES {
  CHARACTER_LIMIT = "Character Limit",
  RANDOM_SEQUENCE_ENCLOSURE = "Random Sequence Enclosure",
  SYSTEM_ROLE = "System Role",
  XML_TAGGING = "XML Tagging",
  EMAIL_WHITELIST = "Email Whitelist",
}

const DEFENCE_DETAILS: OpenAIDefence[] = [
  {
    name: DEFENCE_NAMES.CHARACTER_LIMIT,
    type: DEFENCE_TYPES.CHARACTER_LIMIT,
    info: "Limit the number of characters in the user input. This is a form of prompt validation.",
  },
  {
    name: DEFENCE_NAMES.RANDOM_SEQUENCE_ENCLOSURE,
    type: DEFENCE_TYPES.RANDOM_SEQUENCE_ENCLOSURE,
    info: "Enclose the prompt between a random string and instruct bot to only follow enclosed instructions. This is a form of prompt validation.",
  },
  {
    name: DEFENCE_NAMES.SYSTEM_ROLE,
    type: DEFENCE_TYPES.SYSTEM_ROLE,
    info: "Tell the chat bot to follow a specific role.",
  },
  {
    name: DEFENCE_NAMES.XML_TAGGING,
    type: DEFENCE_TYPES.XML_TAGGING,
    info: "Enclose the users prompt between <user_input> tags and escapes xml characters in raw input. This is a form of prompt validation.",
  },
  {
    name: DEFENCE_NAMES.EMAIL_WHITELIST,
    type: DEFENCE_TYPES.EMAIL_WHITELIST,
    info: "Only allow emails to those on a whitelist. They can be full email addresses, or domains in the format '*@scottlogic.com'",
  },
];

const getActiveDefences = async (): Promise<string[]> => {
  const response = await sendRequest(PATH + "status", "GET");
  const data = await response.json();
  return data;
};

const activateDefence = async (type: string): Promise<boolean> => {
  const response = await sendRequest(
    PATH + "activate",
    "POST",
    { "Content-Type": "application/json" },
    JSON.stringify({ defenceId: type })
  );
  return response.status === 200;
};

const deactivateDefence = async (type: string): Promise<boolean> => {
  const response = await sendRequest(
    PATH + "deactivate",
    "POST",
    {
      "Content-Type": "application/json",
    },
    JSON.stringify({ defenceId: type })
  );
  return response.status === 200;
};

export {
  DEFENCE_DETAILS,
  getActiveDefences,
  activateDefence,
  deactivateDefence,
};
export type { OpenAIDefence };
