import { DefenceConfig } from "./defence";
import { Session } from "./session";

interface Request {
  body: {
    model: string;
    apiKey: string;
    config: DefenceConfig[];
    defenceId: string;
    message: string;
    currentPhase: number;
  };
  session: Session;
}

interface Response {
  send: (data: any) => void;
  status: (code: number) => Response;
  statusCode: number;
}

export type { Request, Response };
