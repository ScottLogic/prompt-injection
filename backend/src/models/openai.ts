interface FunctionAskQuestionParams {
  question: string;
}

interface FunctionSendEmailParams {
  address: string;
  subject: string;
  body: string;
}

export type { FunctionAskQuestionParams, FunctionSendEmailParams };
