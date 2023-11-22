import { Request } from "express";

import { DEFENCE_ID, DefenceConfig } from "@src/models/defence";

export type DefenceConfigResetRequest = Request<
  never,
  DefenceConfig,
  {
    defenceId?: DEFENCE_ID;
    configId?: string;
  },
  never
>;
