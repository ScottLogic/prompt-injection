import { Request } from "express";

import { DEFENCE_TYPES, DefenceConfig } from "@src/models/defence";
import { LEVEL_NAMES } from "@src/models/level";

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
