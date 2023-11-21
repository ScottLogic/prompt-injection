import { Request } from "express";

import { ChatModel } from "@src/models/chat";

export type OpenAIGetModelRequest = Request<
  never,
  ChatModel | string,
  never,
  {
    level?: string;
  }
>;
