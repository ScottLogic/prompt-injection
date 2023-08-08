enum ATTACK_TYPES {
  JAILBREAK_PROMPT = "JAILBREAK_PROMPT",
}

interface AttackInfo {
  id: ATTACK_TYPES;
  name: string;
  info: string;
}

export { ATTACK_TYPES };
export type { AttackInfo };
