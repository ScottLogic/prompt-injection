import { Request } from "express";

export type OpenAiConfigureModelRequest = Request<
  never,
  never,
  {
    configId?: string;
    value?: number;
  },
  never
>;
