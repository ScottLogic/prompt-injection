import { Request } from "express";
import { PHASE_NAMES } from "../phase";
import { CHAT_MESSAGE_TYPE } from "../chat";

type OpenAiAddHistoryRequest = Request<
  object,
  object,
  {
    chatMessageType?: CHAT_MESSAGE_TYPE;
    message?: string;
    phase?: PHASE_NAMES;
  },
  object
>;

export type { OpenAiAddHistoryRequest };
