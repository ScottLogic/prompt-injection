interface PromptEvaluationChainReply {
  isPromptInjectOrMalicious: string;
}

interface QaChainReply {
  text: string;
}

export type { PromptEvaluationChainReply, QaChainReply };
