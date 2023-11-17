import { Request } from "express";

export type LevelGetPromptRequest = Request<
  null,
  string,
  null,
  {
    level?: string;
  }
>;
