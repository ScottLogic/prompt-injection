import { Request } from "express";

import { LEVEL_NAMES } from "@src/models/level";

export type EmailClearRequest = Request<
  never,
  never,
  {
    level?: LEVEL_NAMES;
  },
  never
>;
