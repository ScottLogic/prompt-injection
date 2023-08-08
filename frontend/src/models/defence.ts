enum DEFENCE_TYPES {
  CHARACTER_LIMIT = "CHARACTER_LIMIT",
  RANDOM_SEQUENCE_ENCLOSURE = "RANDOM_SEQUENCE_ENCLOSURE",
  SYSTEM_ROLE = "SYSTEM_ROLE",
  XML_TAGGING = "XML_TAGGING",
  EMAIL_WHITELIST = "EMAIL_WHITELIST",
  LLM_EVALUATION = "LLM_EVALUATION",
}

class DefenceInfo {
  constructor(id: DEFENCE_TYPES, name: string, info: string) {
    this.id = id;
    this.name = name;
    this.info = info;
    // each defence starts off as inactive and not triggered
    this.isActive = false;
    this.isTriggered = false;
  }

  id: DEFENCE_TYPES;
  name: string;
  info: string;
  isActive: boolean;
  isTriggered: boolean;
}

export { DEFENCE_TYPES, DefenceInfo };
