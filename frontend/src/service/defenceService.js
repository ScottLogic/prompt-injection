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

export { getActiveDefences, activateDefence, deactivateDefence };
