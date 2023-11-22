import { Request } from "express";

import { DEFENCE_ID } from "@src/models/defence";
import { LEVEL_NAMES } from "@src/models/level";

export type DefenceActivateRequest = Request<
  never,
  never,
  {
    defenceId?: DEFENCE_ID;
    level?: LEVEL_NAMES;
  },
  never
>;
