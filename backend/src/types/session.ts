import { ChatCompletion } from "./chat";
import { DefenceInfo } from "./defence";
import { EmailInfo } from "./email";

interface Session {
  chatHistory: ChatCompletion[];
  sentEmails: EmailInfo[];
  defences: DefenceInfo[];
  apiKey: string;
  gptModel: string;
  numPhasesCompleted: number;
}

export type { Session };
