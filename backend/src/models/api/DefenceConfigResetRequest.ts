import { Request } from "express";
import { DEFENCE_TYPES, DefenceConfig } from "../defence";

type DefenceConfigResetRequest = Request<
  null,
  DefenceConfig,
  {
    defenceId?: DEFENCE_TYPES;
    configId?: string;
  },
  null
>;

export type { DefenceConfigResetRequest };
