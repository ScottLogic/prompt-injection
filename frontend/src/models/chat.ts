import { DEFENCE_TYPES } from "./defence";

enum CHAT_MODELS {
  GPT_4 = "gpt-4",
  GPT_4_0613 = "gpt-4-0613",
  GPT_4_32K = "gpt-4-32k",
  GPT_4_32K_0613 = "gpt-4-32k-0613",
  GPT_3_5_TURBO = "gpt-3.5-turbo",
  GPT_3_5_TURBO_0613 = "gpt-3.5-turbo-0613",
  GPT_3_5_TURBO_16K = "gpt-3.5-turbo-16k",
  GPT_3_5_TURBO_16K_0613 = "gpt-3.5-turbo-16k-0613",
}

enum CHAT_MESSAGE_TYPE {
  BOT,
  BOT_BLOCKED,
  INFO,
  USER,
  USER_TRANSFORMED,
  PHASE_INFO,
  DEFENCE_ALERTED,
  DEFENCE_TRIGGERED,
  SYSTEM,
  FUNCTION_CALL,
}

enum MODEL_CONFIG {
  TEMPERATURE = "temperature",
  TOP_P = "topP",
  FREQUENCY_PENALTY = "frequencyPenalty",
  PRESENCE_PENALTY = "presencePenalty",
}

interface ChatModel {
  id: CHAT_MODELS;
  configuration: ChatModelConfiguration;
}

interface ChatModelConfiguration {
  id: MODEL_CONFIG;
  value: number;
  min: number;
  max: number;
  default: number;
  step: number;
}

interface ChatDefenceReport {
  blockedReason: string;
  isBlocked: boolean;
  alertedDefences: DEFENCE_TYPES[];
  triggeredDefences: DEFENCE_TYPES[];
}

interface ChatMessage {
  message: string;
  type: CHAT_MESSAGE_TYPE;
}

interface ChatResponse {
  reply: string;
  defenceInfo: ChatDefenceReport;
  numPhasesCompleted: number;
  transformedMessage: string;
  wonPhase: boolean;
}

interface ChatCompletionRequestMessage {
  role: string;
  name: string | null;
  content: string;
}

interface ChatHistoryMessage {
  completion: ChatCompletionRequestMessage | null;
  chatMessageType: CHAT_MESSAGE_TYPE;
  infoMessage: string | null | undefined;
}

export type {
  ChatMessage,
  ChatResponse,
  ChatHistoryMessage,
  ChatModel,
  ChatModelConfiguration,
};
export { CHAT_MODELS, CHAT_MESSAGE_TYPE, MODEL_CONFIG };
