import { sendRequest } from "./backendService";

const PATH = "email/";

async function clearEmails() {
  const response = await sendRequest(PATH + "clear", "POST");
  return response.status === 200;
}

async function getSentEmails() {
  const response = await sendRequest(PATH + "get", "GET");
  const data = await response.json();
  return data;
}

export { clearEmails, getSentEmails };
