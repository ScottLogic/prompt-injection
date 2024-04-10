import { Request } from "express";
import { DEFENCE_TYPES } from "../defence";
import { PHASE_NAMES } from "../phase";

type DefenceActivateRequest = Request<
  object,
  object,
  {
    defenceId?: DEFENCE_TYPES;
    phase?: PHASE_NAMES;
  },
  object
>;

export type { DefenceActivateRequest };
