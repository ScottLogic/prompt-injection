import { Request } from "express";

import { LEVEL_NAMES } from "@src/models/level";

type GetRequestQueryLevel = Request<
  object,
  object,
  object,
  {
    level?: LEVEL_NAMES;
  }
>;

export type { GetRequestQueryLevel };
