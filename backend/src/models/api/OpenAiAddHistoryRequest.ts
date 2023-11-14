import { Request } from "express";

import { CHAT_MESSAGE_TYPE } from "@src/models/chat";
import { LEVEL_NAMES } from "@src/models/level";

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
