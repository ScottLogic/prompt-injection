import { Request } from "express";
import { DEFENCE_TYPES, DefenceConfig } from "../defence";
import { LEVEL_NAMES } from "../level";

type DefenceConfigureRequest = Request<
  null,
  null,
  {
    config?: DefenceConfig[];
    defenceId?: DEFENCE_TYPES;
    level?: LEVEL_NAMES;
  },
  null
>;

export type { DefenceConfigureRequest };
