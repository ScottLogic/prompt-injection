import { Request } from "express";
import { LEVEL_NAMES } from "../level";

export type OpenAiChatRequest = Request<
  never,
  never,
  {
    currentLevel?: LEVEL_NAMES;
    message?: string;
  },
  never
>;
