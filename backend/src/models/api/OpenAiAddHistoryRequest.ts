import { Request } from "express";
import { LEVEL_NAMES } from "../level";
import { CHAT_MESSAGE_TYPE } from "../chat";

type OpenAiAddHistoryRequest = Request<
  object,
  object,
  {
    chatMessageType?: CHAT_MESSAGE_TYPE;
    message?: string;
    level?: LEVEL_NAMES;
  },
  object
>;

export type { OpenAiAddHistoryRequest };
