import { Request } from "express";
import { ChatHistoryMessage } from "../chat";

type OpenAiGetHistoryRequest = Request<
  null,
  ChatHistoryMessage[] | string,
  null,
  {
    level?: string;
  }
>;

export type { OpenAiGetHistoryRequest };
