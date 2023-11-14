import { Request } from "express";
import { LEVEL_NAMES } from "../level";

type GetRequestQueryLevel = Request<
  object,
  object,
  object,
  {
    level?: LEVEL_NAMES;
  }
>;

export type { GetRequestQueryLevel };
