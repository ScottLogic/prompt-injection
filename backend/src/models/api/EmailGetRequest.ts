import { Request } from "express";

import { EmailInfo } from "@src/models/email";

export type EmailGetRequest = Request<
  never,
  EmailInfo[] | string,
  never,
  {
    level?: string;
  }
>;
