import { Request } from "express";
import { DEFENCE_TYPES } from "../defence";

type DefenceConfigResetRequest = Request<
  object,
  object,
  {
    defenceId?: DEFENCE_TYPES;
    configId?: string;
  },
  object
>;

export type { DefenceConfigResetRequest };
