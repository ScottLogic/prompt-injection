import { Request } from "express";
import { DEFENCE_TYPES } from "../defence";
import { LEVEL_NAMES } from "../level";

export type DefenceActivateRequest = Request<
  never,
  never,
  {
    defenceId?: DEFENCE_TYPES;
    level?: LEVEL_NAMES;
  },
  never
>;
