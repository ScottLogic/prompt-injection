import { sendRequest } from "./backendService";
import { EmailInfo } from "../models/email";

const PATH = "email/";

async function clearEmails(phase: number): Promise<boolean> {
  const response = await sendRequest(
    `${PATH  }clear`,
    "POST",
    {
      "Content-Type": "application/json",
    },
    JSON.stringify({ phase: phase })
  );
  return response.status === 200;
}

async function getSentEmails(phase: number) {
  const response = await sendRequest(`${PATH  }get?phase=${  phase}`, "GET");
  const data = await response.json() as EmailInfo[];
  return data;
}

export { clearEmails, getSentEmails };
