const URL = "http://localhost:3001/";

async function sendRequest(path, method, headers, body) {
  const init = {
    credentials: "include",
    method: method,
  };
  if (headers) {
    init.headers = headers;
  }
  if (body) {
    init.body = body;
  }
  const response = await fetch(URL + path, init);
  return response;
}

export { sendRequest };
