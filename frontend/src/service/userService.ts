import { sendRequest } from "./backendService";

const PATH = "user/";

async function isNewUser() {
  const response = await sendRequest(`${PATH}isNew`, "GET");
  const isNew = (await response.json()) as boolean;
  return isNew;
}

export { isNewUser };
