function getBackendUrl(): string {
  const URL = import.meta.env.VITE_BACKEND_URL;
  if (!URL) throw new Error("VITE_BACKEND_URL env variable not set");
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
  const response: Response = await fetch(getBackendUrl() + path, init);
  return response;
}

export { getBackendUrl, sendRequest };
