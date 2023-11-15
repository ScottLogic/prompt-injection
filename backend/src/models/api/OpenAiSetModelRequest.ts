import { Request } from "express";
import { CHAT_MODELS, ChatModelConfiguration } from "../chat";

type OpenAiSetModelRequest = Request<
  null,
  null,
  {
    model?: CHAT_MODELS;
    configuration?: ChatModelConfiguration;
  },
  null
>;

export type { OpenAiSetModelRequest };
