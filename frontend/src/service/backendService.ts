const URL = "http://localhost:3001/";

function getBackendUrl(): string {
  return URL;
}

async function sendRequest(
  path: string,
  method: string,
  headers?: HeadersInit,
  body?: BodyInit
): Promise<Response> {
  const init: RequestInit = {
    credentials: "include",
    method: method,
  };
  if (headers) {
    init.headers = headers;
  }
  if (body) {
    init.body = body;
  }
  const response: Response = await fetch(URL + path, init);
  return response;
}

export { getBackendUrl, sendRequest };
