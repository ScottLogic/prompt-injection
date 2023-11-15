import { Request } from "express";

type OpenAiConfigureModelRequest = Request<
  null,
  null,
  {
    configId?: string;
    value?: number;
  },
  null
>;

export type { OpenAiConfigureModelRequest };
