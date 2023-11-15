import { Request } from "express";
import { EmailInfo } from "../email";

type EmailGetRequest = Request<
  null,
  EmailInfo[] | string,
  null,
  {
    level?: string;
  }
>;

export type { EmailGetRequest };
