import { ChatCompletionRequestMessage } from "openai";

import { DEFENCE_ID } from "./defence";

enum CHAT_MODELS {
  GPT_4_TURBO = "gpt-4-1106-preview",
  GPT_4 = "gpt-4",
  GPT_4_0613 = "gpt-4-0613",
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
  LEVEL_INFO,
  DEFENCE_ALERTED,
  DEFENCE_TRIGGERED,
  SYSTEM,
  FUNCTION_CALL,
  ERROR_MSG,
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
  temperature: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
}

interface ChatDefenceReport {
  blockedReason: string | null;
  isBlocked: boolean;
  alertedDefences: DEFENCE_ID[];
  triggeredDefences: DEFENCE_ID[];
}

interface ChatAnswer {
  reply: string;
  questionAnswered: boolean;
}

interface ChatMalicious {
  isMalicious: boolean;
  reason: string;
}

interface ChatResponse {
  completion: ChatCompletionRequestMessage | null;
  defenceInfo: ChatDefenceReport;
  wonLevel: boolean;
}

interface ChatHttpResponse {
  reply: string;
  defenceInfo: ChatDefenceReport;
  transformedMessage: string;
  wonLevel: boolean;
  isError: boolean;
}

interface ChatHistoryMessage {
  completion: ChatCompletionRequestMessage | null;
  chatMessageType: CHAT_MESSAGE_TYPE;
  numTokens?: number | null;
  infoMessage?: string | null;
}

// default settings for chat model
const defaultChatModel: ChatModel = {
  id: CHAT_MODELS.GPT_3_5_TURBO,
  configuration: {
    temperature: 1,
    topP: 1,
    frequencyPenalty: 0,
    presencePenalty: 0,
  },
};

export type {
  ChatAnswer,
  ChatDefenceReport,
  ChatMalicious,
  ChatResponse,
  ChatHttpResponse,
  ChatHistoryMessage,
};
export {
  CHAT_MODELS,
  CHAT_MESSAGE_TYPE,
  MODEL_CONFIG,
  ChatModel,
  ChatModelConfiguration,
  defaultChatModel,
};
