import { Request } from "express";
import { PHASE_NAMES } from "../phase";

type OpenAiClearRequest = Request<
  object,
  object,
  {
    phase?: PHASE_NAMES;
  },
  object
>;

export type { OpenAiClearRequest };
