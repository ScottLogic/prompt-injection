import { Request } from "express";

export type LevelGetPromptRequest = Request<
  never,
  string,
  never,
  {
    level?: string;
  }
>;
