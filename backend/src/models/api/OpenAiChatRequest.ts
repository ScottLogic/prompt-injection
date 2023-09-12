import { Request } from "express";
import { PHASE_NAMES } from "../phase";

type OpenAiChatRequest = Request<
  object,
  object,
  {
    currentPhase?: PHASE_NAMES;
    message?: string;
  },
  object
>;

export type { OpenAiChatRequest };
