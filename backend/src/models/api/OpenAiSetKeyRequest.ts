import { Request } from "express";

type OpenAiSetKeyRequest = Request<
  object,
  object,
  {
    openAiApiKey: string;
  },
  object
>;

export type { OpenAiSetKeyRequest };
