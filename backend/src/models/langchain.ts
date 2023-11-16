interface PromptEvaluationChainReply {
	promptInjectionEval: string;
	maliciousInputEval: string;
}

interface QaChainReply {
	text: string;
}

export type { PromptEvaluationChainReply, QaChainReply };
