import { ATTACK_TYPES, AttackInfo } from "./models/attack";

const ATTACKS: AttackInfo[] = [
  {
    id: ATTACK_TYPES.JAILBREAK_PROMPT,
    name: "Jailbreak Prompt",
    info: "Using prompt injection, get the chat bot in a state where it no longer follows its original instructions.",
  },
];

export default ATTACKS;
