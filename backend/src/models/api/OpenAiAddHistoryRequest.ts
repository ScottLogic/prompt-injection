import { Request } from "express";
import { LEVEL_NAMES } from "../level";
import { CHAT_MESSAGE_TYPE } from "../chat";

type OpenAiAddHistoryRequest = Request<
  null,
  null,
  {
    chatMessageType?: CHAT_MESSAGE_TYPE;
    message?: string;
    level?: LEVEL_NAMES;
  },
  null
>;

export type { OpenAiAddHistoryRequest };
