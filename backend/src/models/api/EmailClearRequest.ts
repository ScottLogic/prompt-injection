import { Request } from "express";
import { LEVEL_NAMES } from "../level";

export type EmailClearRequest = Request<
  null,
  null,
  {
    level?: LEVEL_NAMES;
  },
  null
>;
