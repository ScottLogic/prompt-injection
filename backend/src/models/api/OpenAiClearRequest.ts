import { Request } from "express";
import { LEVEL_NAMES } from "../level";

type OpenAiClearRequest = Request<
  null,
  null,
  {
    level?: LEVEL_NAMES;
  },
  null
>;

export type { OpenAiClearRequest };
