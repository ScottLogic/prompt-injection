import { Request } from "express";
import { EmailInfo } from "../email";

export type EmailGetRequest = Request<
  never,
  EmailInfo[] | string,
  never,
  {
    level?: string;
  }
>;
