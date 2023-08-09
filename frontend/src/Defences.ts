import { DEFENCE_TYPES, DefenceConfig, DefenceInfo } from "./models/defence";

const DEFENCE_DETAILS: DefenceInfo[] = [
  new DefenceInfo(
    DEFENCE_TYPES.CHARACTER_LIMIT,
    "Character Limit",
    "Limit the number of characters in the user input. This is a form of prompt validation.",
    [new DefenceConfig("maxMessageLength", "max message length")]
  ),
  new DefenceInfo(
    DEFENCE_TYPES.EMAIL_WHITELIST,
    "Email Whitelist",
    "Only allow emails to those on a whitelist. They can be full email addresses, or domains in the format '*@scottlogic.com'",
    [new DefenceConfig("whitelist", "email whitelist")]
  ),
  new DefenceInfo(
    DEFENCE_TYPES.RANDOM_SEQUENCE_ENCLOSURE,
    "Random Sequence Enclosure",
    "Enclose the prompt between a random string and instruct bot to only follow enclosed instructions. This is a form of prompt validation.",
    [
      new DefenceConfig("prePrompt", "pre-prompt"),
      new DefenceConfig("length", "length"),
    ]
  ),
  new DefenceInfo(
    DEFENCE_TYPES.SYSTEM_ROLE,
    "System Role",
    "Tell the chat bot to follow a specific role.",
    [new DefenceConfig("systemRole", "system role")]
  ),
  new DefenceInfo(
    DEFENCE_TYPES.XML_TAGGING,
    "XML Tagging",
    "Enclose the users prompt between <user_input> tags and escapes xml characters in raw input. This is a form of prompt validation.",
    []
  ),
  new DefenceInfo(
    DEFENCE_TYPES.LLM_EVALUATION,
    "LLM Evaluation",
    "Use an LLM to evaluate the user input for malicious content or prompt injection. ",
    []
  ),
  new DefenceInfo(
    DEFENCE_TYPES.LLM_EVALUATION,
    "LLM Evaluation",
    "Use a LLM to evaluate the user input for malicious content or prompt injection. "
  ),
];

export { DEFENCE_DETAILS };
