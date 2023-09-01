import { sendRequest } from "./backendService";

async function getDocumentUris(): Promise<Document[]> {
  const response = await sendRequest("documents", "GET");
  const data = await response.json();
  return data;
}

export { getDocumentUris };
