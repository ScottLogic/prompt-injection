import { sendRequest } from "./backendService";

const PATH = "defence/";

interface OpenAIDefence {
  name: string;
  id: string;
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

const DEFENCE_DETAILS: OpenAIDefence[] = [
  {
    id: DEFENCE_TYPES.CHARACTER_LIMIT,
    name: "Character Limit",
    info: "Limit the number of characters in the user input. This is a form of prompt validation.",
  },
  {
    id: DEFENCE_TYPES.RANDOM_SEQUENCE_ENCLOSURE,
    name: "Random Sequence Enclosure",
    info: "Enclose the prompt between a random string and instruct bot to only follow enclosed instructions. This is a form of prompt validation.",
  },
  {
    id: DEFENCE_TYPES.SYSTEM_ROLE,
    name: "System Role",
    info: "Tell the chat bot to follow a specific role.",
  },
  {
    id: DEFENCE_TYPES.XML_TAGGING,
    name: "XML Tagging",
    info: "Enclose the users prompt between <user_input> tags and escapes xml characters in raw input. This is a form of prompt validation.",
  },
  {
    id: DEFENCE_TYPES.EMAIL_WHITELIST,
    name: "Email Whitelist",
    info: "Only allow emails to those on a whitelist. They can be full email addresses, or domains in the format '*@scottlogic.com'",
  },
];

const getActiveDefences = async (): Promise<string[]> => {
  const response = await sendRequest(PATH + "status", "GET");
  const data = await response.json();
  return data;
};

const activateDefence = async (id: string): Promise<boolean> => {
  const response = await sendRequest(
    PATH + "activate",
    "POST",
    { "Content-Type": "application/json" },
    JSON.stringify({ defenceId: id })
  );
  return response.status === 200;
};

const deactivateDefence = async (id: string): Promise<boolean> => {
  const response = await sendRequest(
    PATH + "deactivate",
    "POST",
    {
      "Content-Type": "application/json",
    },
    JSON.stringify({ defenceId: id })
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
