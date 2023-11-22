import { Response } from "express";

import { LevelGetPromptRequest } from "@src/models/api/LevelGetPromptRequest";
import { LEVEL_NAMES } from "@src/models/level";
import {
  systemRoleLevel1,
  systemRoleLevel2,
  systemRoleLevel3,
} from "@src/promptTemplates";

function handleGetLevelPrompt(req: LevelGetPromptRequest, res: Response) {
  const levelStr: string | undefined = req.query.level as string | undefined;
  if (levelStr === undefined) {
    res.status(400).send();
  } else {
    const level = parseInt(levelStr) as LEVEL_NAMES;
    switch (level) {
      case LEVEL_NAMES.LEVEL_1:
        res.send(systemRoleLevel1);
        break;
      case LEVEL_NAMES.LEVEL_2:
        res.send(systemRoleLevel2);
        break;
      case LEVEL_NAMES.LEVEL_3:
        res.send(systemRoleLevel3);
        break;
      default:
        res.status(400).send();
        break;
    }
  }
}

export { handleGetLevelPrompt };