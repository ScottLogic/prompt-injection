import { Request } from "express";

import { DEFENCE_ID, DefenceConfigItem } from "@src/models/defence";
import { LEVEL_NAMES } from "@src/models/level";

export type DefenceConfigureRequest = Request<
  never,
  null | string,
  {
    config?: DefenceConfigItem[];
    defenceId?: DEFENCE_ID;
    level?: LEVEL_NAMES;
  },
  never
>;
