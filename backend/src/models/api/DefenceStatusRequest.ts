import { Request } from "express";

import { Defence } from "@src/models/defence";

export type DefenceStatusRequest = Request<
  never,
  Defence[] | string,
  never,
  {
    level?: string;
  }
>;
