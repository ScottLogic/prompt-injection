function getBackendUrl(): string {
  const url = import.meta.env.VITE_BACKEND_URL;
  if (!url) throw new Error("VITE_BACKEND_URL env variable not set");
  return url;
}

function makeUrl(path: string): URL {
  const url = new URL(path, getBackendUrl());
  return url;
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
  const response: Response = await fetch(makeUrl(path), init);
  return response;
}

export { getBackendUrl, sendRequest };
