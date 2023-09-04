import { RemoteDocument } from "../models/document";
import { getBackendUrl, sendRequest } from "./backendService";

async function getDocumentUris(): Promise<RemoteDocument[]> {
  const path = "documents";
  const response = await sendRequest(path, "GET");
  let documents: RemoteDocument[] = await response.json();
  documents = documents.map((document) => {
    return {
      ...document,
      uri: `${getBackendUrl()}${path}/${document.filename}`,
    }
  });
  return documents;
}

export { getDocumentUris };
