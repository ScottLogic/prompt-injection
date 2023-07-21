import { sendRequest } from "./backendService";

const PATH = "defence/";

async function getActiveDefences() {
  const response = await sendRequest(PATH + "status", "GET");
  const data = await response.json();
  return data;
}

async function activateDefence(id) {
  const response = await sendRequest(
    PATH + "activate",
    "POST",
    { "Content-Type": "application/json" },
    JSON.stringify({ defenceId: id })
  );
  return response.status === 200;
}

async function deactivateDefence(id) {
  const response = await sendRequest(
    PATH + "deactivate",
    "POST",
    {
      "Content-Type": "application/json",
    },
    JSON.stringify({ defenceId: id })
  );
  return response.status === 200;
}

async function transformInputPrompt(message) {
  const response = await sendRequest(
    PATH + "transform",
    "POST",
    {
      "Content-Type": "application/json",
    },
    JSON.stringify({ message })
  );
  // convert from readable stream
  return response.body
    .getReader()
    .read()
    .then((result) => {
      const decoder = new TextDecoder("utf-8");
      return decoder.decode(result.value);
    });
}

export {
  getActiveDefences,
  activateDefence,
  deactivateDefence,
  transformInputPrompt,
};
