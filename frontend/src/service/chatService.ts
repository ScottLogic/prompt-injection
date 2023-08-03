import { sendRequest } from "./backendService";
import { ChatResponse } from "../models/chat";

const PATH = "openai/";

const clearChat = async (): Promise<boolean> => {
  const response = await sendRequest(PATH + "clear", "POST");
  return response.status === 200;
};

const sendMessage = async (message: string): Promise<ChatResponse> => {
  const response = await sendRequest(
    PATH + "chat",
    "POST",
    { "Content-Type": "application/json" },
    JSON.stringify({ message })
  );
  const data = await response.json();
  console.log(data);
  return data;
};

export { clearChat, sendMessage };
