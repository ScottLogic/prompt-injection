import { sendRequest } from "./backendService";

const PATH = "defence/";

const getActiveDefences = async (): Promise<string[]> => {
  const response = await sendRequest(PATH + "status", "GET");
  const data = await response.json();
  return data;
};

const activateDefence = async (id: string): Promise<boolean> => {
  const response = await sendRequest(
    PATH + "activate",
    "POST",
    { "Content-Type": "application/json" },
    JSON.stringify({ defenceId: id })
  );
  return response.status === 200;
};

const deactivateDefence = async (id: string): Promise<boolean> => {
  const response = await sendRequest(
    PATH + "deactivate",
    "POST",
    {
      "Content-Type": "application/json",
    },
    JSON.stringify({ defenceId: id })
  );
  return response.status === 200;
};

export { getActiveDefences, activateDefence, deactivateDefence };
