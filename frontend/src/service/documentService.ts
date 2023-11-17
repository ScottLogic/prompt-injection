import { getBackendUrl, sendRequest } from "./backendService";

import { DocumentMeta } from "@src/models/document";

async function getDocumentMetas(): Promise<DocumentMeta[]> {
  const path = "documents";
  const response = await sendRequest(path, "GET");
  let documentMetas = (await response.json()) as DocumentMeta[];
  documentMetas = documentMetas.map((documentMeta) => {
    return {
      ...documentMeta,
      uri: `${getBackendUrl()}${path}/${documentMeta.folder}/${
        documentMeta.filename
      }`,
    };
  });
  return documentMetas;
}

export { getDocumentMetas };
