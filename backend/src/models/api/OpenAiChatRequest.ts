import { Request } from "express";
import { LEVEL_NAMES } from "../level";

export type OpenAiChatRequest = Request<
  null,
  null,
  {
    currentLevel?: LEVEL_NAMES;
    message?: string;
  },
  null
>;
