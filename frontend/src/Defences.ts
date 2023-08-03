class DefenceInfo {
  constructor(id: DEFENCE_TYPES, name: string, info: string) {
    this.id = id;
    this.name = name;
    this.info = info;
    this.isActive = false;
    this.isTriggered = false;
  }

  id: DEFENCE_TYPES;
  name: string;
  info: string;
  isActive: boolean;
  isTriggered: boolean;
}

enum DEFENCE_TYPES {
  CHARACTER_LIMIT = "CHARACTER_LIMIT",
  RANDOM_SEQUENCE_ENCLOSURE = "RANDOM_SEQUENCE_ENCLOSURE",
  SYSTEM_ROLE = "SYSTEM_ROLE",
  XML_TAGGING = "XML_TAGGING",
  EMAIL_WHITELIST = "EMAIL_WHITELIST",
}

const DEFENCE_DETAILS: DefenceInfo[] = [
  new DefenceInfo(
    DEFENCE_TYPES.CHARACTER_LIMIT,
    "Character Limit",
    "Limit the number of characters in the user input. This is a form of prompt validation."
  ),
  new DefenceInfo(
    DEFENCE_TYPES.EMAIL_WHITELIST,
    "Email Whitelist",
    "Only allow emails to those on a whitelist. They can be full email addresses, or domains in the format '*@scottlogic.com'"
  ),
  new DefenceInfo(
    DEFENCE_TYPES.RANDOM_SEQUENCE_ENCLOSURE,
    "Random Sequence Enclosure",
    "Enclose the prompt between a random string and instruct bot to only follow enclosed instructions. This is a form of prompt validation."
  ),
  new DefenceInfo(
    DEFENCE_TYPES.SYSTEM_ROLE,
    "System Role",
    "Tell the chat bot to follow a specific role."
  ),
  new DefenceInfo(
    DEFENCE_TYPES.XML_TAGGING,
    "XML Tagging",
    "Enclose the users prompt between <user_input> tags and escapes xml characters in raw input. This is a form of prompt validation."
  ),
];

export { DEFENCE_DETAILS };
export type { DefenceInfo };
