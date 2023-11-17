import { Request } from "express";
import { ChatHistoryMessage } from "../chat";

export type OpenAiGetHistoryRequest = Request<
  null,
  ChatHistoryMessage[] | string,
  null,
  {
    level?: string;
  }
>;
