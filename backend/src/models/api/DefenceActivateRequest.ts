import { Request } from "express";
import { DEFENCE_TYPES } from "../defence";
import { LEVEL_NAMES } from "../level";

export type DefenceActivateRequest = Request<
  null,
  null,
  {
    defenceId?: DEFENCE_TYPES;
    level?: LEVEL_NAMES;
  },
  null
>;
