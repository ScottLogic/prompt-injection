import { Request } from "express";
import { ChatHistoryMessage } from "../chat";

export type OpenAiGetHistoryRequest = Request<
  never,
  ChatHistoryMessage[] | string,
  never,
  {
    level?: string;
  }
>;
