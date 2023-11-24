import { DEFENCE_TYPES, DefenceInfo } from "./models/defence";
import {
  promptEvalPrompt,
  qAPromptSecure,
  systemRoleDefault,
  xmlPrompt,
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
  createDefenceInfo(DEFENCE_TYPES.PROMPT_EVALUATION_LLM, [
    {
      id: "prompt",
      value: promptEvalPrompt,
    },
  ]),
  createDefenceInfo(DEFENCE_TYPES.QA_LLM, [
    {
      id: "prompt",
      value: qAPromptSecure,
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
      id: "prompt",
      value: xmlPrompt,
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
