enum DEFENCE_TYPES {
  CHARACTER_LIMIT = "CHARACTER_LIMIT",
  EVALUATION_LLM_INSTRUCTIONS = "EVALUATION_LLM_INSTRUCTIONS",
  QA_LLM_INSTRUCTIONS = "QA_LLM_INSTRUCTIONS",
  SYSTEM_ROLE = "SYSTEM_ROLE",
  XML_TAGGING = "XML_TAGGING",
  FILTER_USER_INPUT = "FILTER_USER_INPUT",
  FILTER_BOT_OUTPUT = "FILTER_BOT_OUTPUT",
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
