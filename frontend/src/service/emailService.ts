import { sendRequest } from "./backendService";
import { EmailInfo } from "../models/email";

const PATH = "email/";

const clearEmails = async (): Promise<boolean> => {
  const response = await sendRequest(PATH + "clear", "POST");
  return response.status === 200;
};

const getSentEmails = async (): Promise<EmailInfo[]> => {
  const response = await sendRequest(PATH + "get", "GET");
  const data = await response.json();
  return data;
};

export { clearEmails, getSentEmails };
