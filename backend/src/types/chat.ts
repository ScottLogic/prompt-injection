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
  INFO,
  USER,
  PHASE_INFO,
}

interface ChatDefenceReport {
  blocked: boolean;
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

interface ChatCompletion {
  role: string;
  content: string;
  name?: string;
  function_call?: any;
}

interface ChatMessage {
  defenceInfo?: ChatDefenceReport;
  message: string;
  isOriginalMessage: boolean;
  type: CHAT_MESSAGE_TYPE;
}

interface ChatResponse {
  reply: string;
  defenceInfo: ChatDefenceReport;
  completion?: ChatCompletion;
  numPhasesCompleted?: number;
  transformedMessage?: string;
  wonPhase?: boolean | null;
}

export type {
  ChatAnswer,
  ChatDefenceReport,
  ChatCompletion,
  ChatMalicious,
  ChatMessage,
  ChatResponse,
};
export { CHAT_MODELS, CHAT_MESSAGE_TYPE };
