import { Request } from "express";
import { CHAT_MODELS, ChatModelConfiguration } from "../chat";

export type OpenAiSetModelRequest = Request<
  never,
  never,
  {
    model?: CHAT_MODELS;
    configuration?: ChatModelConfiguration;
  },
  never
>;
