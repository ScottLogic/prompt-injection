import { Request } from "express";
import { LEVEL_NAMES } from "../level";

type DefenceResetRequest = Request<
  object,
  object,
  {
    level?: LEVEL_NAMES;
  },
  object
>;

export type { DefenceResetRequest };
