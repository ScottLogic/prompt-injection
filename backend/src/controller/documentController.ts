import { Response } from "express";

import { getSandboxDocumentMetas } from "@src/document";

function handleGetDocuments(_: unknown, res: Response) {
  try {
    res.send(getSandboxDocumentMetas());
  } catch (err) {
    res.status(500).send("Failed to read documents");
  }
}

export { handleGetDocuments };
