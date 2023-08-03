import { sendRequest } from "./backendService";

const PATH = "openai/";

interface ChatDefenceReport {
  blocked: boolean;
  triggeredDefences: string[];
}

interface ChatMessage {
  isUser: boolean;
  defenceInfo?: ChatDefenceReport;
  message: string;
  isOriginalMessage: boolean;
}

interface ChatResponse {
  reply: string;
  defenceInfo: ChatDefenceReport;
  transformedMessage: string;
}

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
export type { ChatMessage, ChatResponse };
