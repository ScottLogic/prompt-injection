import { Response } from "express";

import { LEVEL_NAMES } from "@src/models/level";
import {
  systemRoleLevel1,
  systemRoleLevel2,
  systemRoleLevel3,
} from "@src/promptTemplates";

function handleGetSystemRoles(_: unknown, res: Response) {
  const systemRoles = [
    { level: LEVEL_NAMES.LEVEL_1, systemRole: systemRoleLevel1 },
    { level: LEVEL_NAMES.LEVEL_2, systemRole: systemRoleLevel2 },
    { level: LEVEL_NAMES.LEVEL_3, systemRole: systemRoleLevel3 },
  ];
  res.send(systemRoles);
}

export { handleGetSystemRoles };
