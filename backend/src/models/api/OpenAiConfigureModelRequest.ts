import { Request } from "express";

export type OpenAiConfigureModelRequest = Request<
  null,
  null,
  {
    configId?: string;
    value?: number;
  },
  null
>;
