declare module "express-session" {
  interface Session {
    chatHistory: ChatCompletionRequestMessage[];
    sentEmails: EmailInfo[];
    defences: DefenceInfo[];
    apiKey: string;
    gptModel: string;
    numPhasesCompleted: number;
  }
}

export {};
