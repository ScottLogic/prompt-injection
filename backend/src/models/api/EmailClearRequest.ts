import { Request } from "express";

import { LEVEL_NAMES } from "@src/models/level";

type EmailClearRequest = Request<
  object,
  object,
  {
    level?: LEVEL_NAMES;
  },
  object
>;

export type { EmailClearRequest };
