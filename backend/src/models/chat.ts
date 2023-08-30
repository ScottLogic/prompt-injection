import { ChatCompletionRequestMessage } from "openai";

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

interface ChatDefenceReport {
  blockedReason: string | null;
  isBlocked: boolean;
  triggeredDefences: string[];
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
  completion: ChatCompletionRequestMessage;
  defenceInfo: ChatDefenceReport;
  wonPhase: boolean;
}

interface ChatHttpResponse {
  reply: string;
  defenceInfo: ChatDefenceReport;
  numPhasesCompleted: number;
  transformedMessage: string;
  wonPhase: boolean;
}

interface ChatHistoryMessage {
  completion: ChatCompletionRequestMessage | null;
  chatMessageType: CHAT_MESSAGE_TYPE;
  isOriginalMessage?: boolean;
  infoMessage?: string | null;
}

export type {
  ChatAnswer,
  ChatDefenceReport,
  ChatMalicious,
  ChatResponse,
  ChatHttpResponse,
  ChatHistoryMessage,
};
export { CHAT_MODELS, CHAT_MESSAGE_TYPE };
