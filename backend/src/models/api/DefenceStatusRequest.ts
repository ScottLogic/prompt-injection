import { Request } from "express";
import { DefenceInfo } from "../defence";

type DefenceStatusRequest = Request<
  null,
  DefenceInfo[] | string,
  null,
  {
    level?: string;
  }
>;

export type { DefenceStatusRequest };
