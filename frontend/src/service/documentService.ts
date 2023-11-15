import { DocumentMeta } from "../models/document";
import { getBackendUrl, sendRequest } from "./backendService";

async function getDocumentMetas(): Promise<DocumentMeta[]> {
  const path = "documents";
  const response = await sendRequest(path, "GET");
  let documents = (await response.json()) as DocumentMeta[];
  documents = documents.map((document) => {
    return {
      ...document,
      uri: `${getBackendUrl()}${path}/${document.folder}/${document.filename}`,
    };
  });
  return documents;
}

export { getDocumentMetas };
