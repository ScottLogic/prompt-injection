enum DEFENCE_TYPES {
  CHARACTER_LIMIT = "CHARACTER_LIMIT",
  EMAIL_WHITELIST = "EMAIL_WHITELIST",
  LLM_EVALUATION = "LLM_EVALUATION",
  QA_LLM_INSTRUCTIONS = "QA_LLM_INSTRUCTIONS",
  RANDOM_SEQUENCE_ENCLOSURE = "RANDOM_SEQUENCE_ENCLOSURE",
  SYSTEM_ROLE = "SYSTEM_ROLE",
  XML_TAGGING = "XML_TAGGING",
}

interface DefenceConfig {
  id: string;
  value: string;
}

class DefenceInfo {
  constructor(id: DEFENCE_TYPES, config: DefenceConfig[]) {
    this.id = id;
    this.config = config;
    // each defence starts off as inactive and not triggered
    this.isActive = false;
    this.isTriggered = false;
  }

  id: DEFENCE_TYPES;
  config: DefenceConfig[];
  isActive: boolean;
  isTriggered: boolean;
}

export { DEFENCE_TYPES, DefenceInfo };
export type { DefenceConfig };
