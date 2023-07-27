import { sendRequest } from "./backendService";

const PATH = "email/";

interface OpenAIEmail {
  address: string;
  subject: string;
  content: string;
}

const clearEmails = async (): Promise<boolean> => {
  const response = await sendRequest(PATH + "clear", "POST");
  return response.status === 200;
};

const getSentEmails = async (): Promise<OpenAIEmail[]> => {
  const response = await sendRequest(PATH + "get", "GET");
  const data = await response.json();
  return data;
};

export { clearEmails, getSentEmails };
export type { OpenAIEmail };
