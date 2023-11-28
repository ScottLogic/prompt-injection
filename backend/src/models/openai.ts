interface FunctionAskQuestionParams {
	question: string;
}

interface FunctionSendEmailParams {
	address: string;
	subject: string;
	body: string;
	confirmed: boolean;
}

export type { FunctionAskQuestionParams, FunctionSendEmailParams };
