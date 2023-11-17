import { Request } from "express";
import { EmailInfo } from "../email";

export type EmailGetRequest = Request<
  null,
  EmailInfo[] | string,
  null,
  {
    level?: string;
  }
>;
