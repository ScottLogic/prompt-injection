const URL = "http://localhost:3001/";

const sendRequest = async (
  path: string,
  method: string,
  headers?: HeadersInit,
  body?: BodyInit
): Promise<Response> => {
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
};

export { sendRequest };
