import { sendRequest } from "./backendService";
import { EmailInfo } from "../models/email";

const PATH = "email/";

const clearEmails = async (phase: number): Promise<boolean> => {
  const response = await sendRequest(
    PATH + "clear",
    "POST",
    {
      "Content-Type": "application/json",
    },
    JSON.stringify({ phase: phase })
  );
  return response.status === 200;
};

const getSentEmails = async (phase: number): Promise<EmailInfo[]> => {
  const response = await sendRequest(PATH + "get?phase=" + phase, "GET");
  const data = await response.json();
  return data;
};

export { clearEmails, getSentEmails };
