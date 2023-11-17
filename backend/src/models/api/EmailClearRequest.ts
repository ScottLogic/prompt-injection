import { Request } from "express";
import { LEVEL_NAMES } from "../level";

export type EmailClearRequest = Request<
  never,
  never,
  {
    level?: LEVEL_NAMES;
  },
  never
>;
