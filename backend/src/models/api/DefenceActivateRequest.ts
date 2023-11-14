import { Request } from "express";

import { DEFENCE_TYPES } from "../defence";
import { LEVEL_NAMES } from "../level";

type DefenceActivateRequest = Request<
  object,
  object,
  {
    defenceId?: DEFENCE_TYPES;
    level?: LEVEL_NAMES;
  },
  object
>;

export type { DefenceActivateRequest };
