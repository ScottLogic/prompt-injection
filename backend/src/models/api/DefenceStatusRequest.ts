import { Request } from "express";
import { DefenceInfo } from "../defence";

export type DefenceStatusRequest = Request<
  null,
  DefenceInfo[] | string,
  null,
  {
    level?: string;
  }
>;
