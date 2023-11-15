import { Request } from "express";
import { DEFENCE_TYPES } from "../defence";

type DefenceConfigResetRequest = Request<
  null,
  null,
  {
    defenceId?: DEFENCE_TYPES;
    configId?: string;
  },
  null
>;

export type { DefenceConfigResetRequest };
