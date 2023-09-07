import { Request } from "express";
import { DEFENCE_TYPES, DefenceConfig } from "../defence";
import { PHASE_NAMES } from "../phase";

type DefenceConfigureRequest = Request<
  object,
  object,
  {
    config?: DefenceConfig[];
    defenceId?: DEFENCE_TYPES;
    phase?: PHASE_NAMES;
  },
  object
>;

export type { DefenceConfigureRequest };
