import { ATTACK_TYPES, AttackInfo } from "./models/attack";

const ATTACKS_LEVEL_2: AttackInfo[] = [
  {
    id: ATTACK_TYPES.JAILBREAK,
    name: "Jailbreak Prompt",
    info: "Give the chat bot a prompt that will cause it to break out of its original instructions and start following your instructions instead.",
  },
  {
    id: ATTACK_TYPES.PARTIAL_REVEAL,
    name: "Partial Reveal",
    info:
      "The chat bot will not reveal its secrets in full, but it may reveal it in parts. " +
      "It may be possible to get synonyms of a secret word, or the number of letters it contains.",
  },
  {
    id: ATTACK_TYPES.PROMPT_LEAKING,
    name: "Prompt Leaking",
    info:
      "Get the chat bot to reveal its original instructions. " +
      "Knowing these may help you to craft a better jailbreak prompt.",
  },
  {
    id: ATTACK_TYPES.VIRTUALISATION,
    name: "Virtualisation",
    info:
      "Convince the chat bot that it's in a make-believe scenario. " +
      "Getting the bot to roleplay or write poems are examples of virtualisation.",
  },
];

const ATTACKS_LEVEL_3: AttackInfo[] = [
  ...ATTACKS_LEVEL_2,
  {
    id: ATTACK_TYPES.INDIRECT_INJECTION,
    name: "Indirect Injection",
    info:
      "Have the chat bot retrieve a prompt from a webpage or document. " +
      "This can bypass the chat bot's defences which act directly on a user's prompt.",
  },
  {
    id: ATTACK_TYPES.TOKEN_SMUGGLING,
    name: "Token Smuggling",
    info:
      "Replace certain words in a prompt with synonyms or misspellings. " +
      "This can be an effective way of getting around filters.",
  },
];

const ATTACKS_ALL: AttackInfo[] = [
  ...ATTACKS_LEVEL_3,
  {
    id: ATTACK_TYPES.DEFINED_DICTIONARY_ATTACK,
    name: "Defined Dictionary Attack",
    info:
      "Give the chat bot a dictionary to map sentences to other sentences. " +
      "This is effective against filtering and LLM evaluation defences.",
  },
  {
    id: ATTACK_TYPES.PAYLOAD_SPLITTING,
    name: "Payload Splitting",
    info:
      "Split a malicious prompt into multiple parts. " +
      "This is good at getting around filters or LLM evaluation.",
  },
  {
    id: ATTACK_TYPES.RECURSIVE_INJECTION,
    name: "Recursive Injection",
    info:
      "Best used when another LLM is used to check the output of the chat bot. " +
      "Have the chat bot generate an output that the evaluating LLM interprets as a prompt.",
  },
];

export { ATTACKS_LEVEL_2, ATTACKS_LEVEL_3, ATTACKS_ALL };
