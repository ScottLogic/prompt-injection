import { Request } from "express";
import { LEVEL_NAMES } from "../level";

type OpenAiChatRequest = Request<
  null,
  null,
  {
    currentLevel?: LEVEL_NAMES;
    message?: string;
  },
  null
>;

export type { OpenAiChatRequest };
