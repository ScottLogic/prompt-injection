import { Request } from "express";
import { LEVEL_NAMES } from "../level";
import { CHAT_MESSAGE_TYPE } from "../chat";

export type OpenAiAddHistoryRequest = Request<
  never,
  never,
  {
    chatMessageType?: CHAT_MESSAGE_TYPE;
    message?: string;
    level?: LEVEL_NAMES;
  },
  never
>;
