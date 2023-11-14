import { Request } from "express";
import { LEVEL_NAMES } from "../level";

type DefenceStatusRequest = Request<
  object,
  object,
  object,
  {
    level?: LEVEL_NAMES;
  }
>;

export type { DefenceStatusRequest };
