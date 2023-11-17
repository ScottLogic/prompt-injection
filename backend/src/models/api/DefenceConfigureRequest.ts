import { Request } from "express";
import { DEFENCE_TYPES, DefenceConfig } from "../defence";
import { LEVEL_NAMES } from "../level";

export type DefenceConfigureRequest = Request<
  null,
  null,
  {
    config?: DefenceConfig[];
    defenceId?: DEFENCE_TYPES;
    level?: LEVEL_NAMES;
  },
  null
>;
