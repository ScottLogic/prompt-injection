import { Request } from "express";
import { LEVEL_NAMES } from "../level";

type EmailClearRequest = Request<
  null,
  null,
  {
    level?: LEVEL_NAMES;
  },
  null
>;

export type { EmailClearRequest };
