import { Request } from "express";
import { CHAT_MODELS } from "../chat";

type OpenAiSetModelRequest = Request<
  object,
  object,
  {
    model?: CHAT_MODELS;
  },
  object
>;

export type { OpenAiSetModelRequest };
