import { Request } from "express";

type LevelGetPromptRequest = Request<
  null,
  string,
  null,
  {
    level?: string;
  }
>;

export type { LevelGetPromptRequest };
