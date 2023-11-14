import { Request } from "express";

import { DEFENCE_TYPES, DefenceConfig } from "../defence";
import { LEVEL_NAMES } from "../level";

type DefenceConfigureRequest = Request<
  object,
  object,
  {
    config?: DefenceConfig[];
    defenceId?: DEFENCE_TYPES;
    level?: LEVEL_NAMES;
  },
  object
>;

export type { DefenceConfigureRequest };
