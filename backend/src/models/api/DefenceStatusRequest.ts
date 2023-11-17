import { Request } from "express";
import { DefenceInfo } from "../defence";

export type DefenceStatusRequest = Request<
  never,
  DefenceInfo[] | string,
  never,
  {
    level?: string;
  }
>;
