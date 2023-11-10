import { DEFENCE_TYPES, DefenceInfo } from "./models/defence";
import {
  maliciousPromptEvalPrePrompt,
  promptInjectionEvalPrePrompt,
  qAPrePromptSecure,
  systemRoleDefault,
  xmlPrePrompt,
} from "./promptTemplates";

function createDefenceInfo(
  id: DEFENCE_TYPES,
  config: { id: string; value: string }[]
): DefenceInfo {
  const defenceConfig = config.map((item) => ({
    id: item.id,
    value: item.value,
  }));
  return new DefenceInfo(id, defenceConfig);
}

const defaultDefences: DefenceInfo[] = [
  createDefenceInfo(DEFENCE_TYPES.CHARACTER_LIMIT, [
    {
      id: "maxMessageLength",
      value: String(280),
    },
  ]),
  createDefenceInfo(DEFENCE_TYPES.EMAIL_WHITELIST, [
    {
      id: "whitelist",
      value: process.env.EMAIL_WHITELIST ?? "",
    },
  ]),
  createDefenceInfo(DEFENCE_TYPES.EVALUATION_LLM_INSTRUCTIONS, [
    {
      id: "prompt-injection-evaluator-prompt",
      value: promptInjectionEvalPrePrompt,
    },
    {
      id: "malicious-prompt-evaluator-prompt",
      value: maliciousPromptEvalPrePrompt,
    },
  ]),
  createDefenceInfo(DEFENCE_TYPES.QA_LLM_INSTRUCTIONS, [
    {
      id: "prePrompt",
      value: qAPrePromptSecure,
    },
  ]),
  createDefenceInfo(DEFENCE_TYPES.RANDOM_SEQUENCE_ENCLOSURE, [
    {
      id: "prePrompt",
      value: process.env.RANDOM_SEQ_ENCLOSURE_PRE_PROMPT ?? "",
    },
    {
      id: "length",
      value: process.env.RANDOM_SEQ_ENCLOSURE_LENGTH ?? String(10),
    },
  ]),
  createDefenceInfo(DEFENCE_TYPES.SYSTEM_ROLE, [
    {
      id: "systemRole",
      value: systemRoleDefault,
    },
  ]),
  createDefenceInfo(DEFENCE_TYPES.XML_TAGGING, [
    {
      id: "prePrompt",
      value: xmlPrePrompt,
    },
  ]),
  createDefenceInfo(DEFENCE_TYPES.FILTER_USER_INPUT, [
    {
      id: "filterUserInput",
      value: "secret project,confidential project,budget,password",
    },
  ]),
  createDefenceInfo(DEFENCE_TYPES.FILTER_BOT_OUTPUT, [
    {
      id: "filterBotOutput",
      value: "secret project",
    },
  ]),
];

export { defaultDefences };
