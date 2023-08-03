interface ChatDefenceReport {
  blocked: boolean;
  triggeredDefences: string[];
}

interface ChatMessage {
  isUser: boolean;
  defenceInfo?: ChatDefenceReport;
  message: string;
  isOriginalMessage: boolean;
}

interface ChatResponse {
  reply: string;
  defenceInfo: ChatDefenceReport;
  transformedMessage: string;
}

export type { ChatMessage, ChatResponse };
