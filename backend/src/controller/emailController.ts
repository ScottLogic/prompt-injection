import { Response } from "express";
import { GetRequestQueryLevel } from "../models/api/GetRequestQueryLevel";
import { EmailClearRequest } from "../models/api/EmailClearRequest";
import { LEVEL_NAMES } from "../models/level";

function handleGetEmails(req: GetRequestQueryLevel, res: Response) {
  const level: number | undefined = req.query.level as number | undefined;
  if (level !== undefined) {
    res.send(req.session.levelState[level].sentEmails);
  } else {
    res.status(400);
    res.send("Missing level");
  }
}

function handleClearEmails(req: EmailClearRequest, res: Response) {
  const level = req.body.level;
  if (level !== undefined && level >= LEVEL_NAMES.LEVEL_1) {
    req.session.levelState[level].sentEmails = [];
    console.debug("Emails cleared");
    res.send();
  } else {
    res.status(400);
    res.send();
  }
}

export { handleGetEmails, handleClearEmails };
