import { sendRequest } from "./backendService";
import { CHAT_MODELS, ChatMessage, ChatResponse } from "../models/chat";
import { PHASE_NAMES } from "../models/phase";

const PATH = "openai/";

const clearChat = async (phase: number): Promise<boolean> => {
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

const sendMessage = async (
  message: string,
  currentPhase: PHASE_NAMES
): Promise<ChatResponse> => {
  const response = await sendRequest(
    PATH + "chat",
    "POST",
    { "Content-Type": "application/json" },
    JSON.stringify({ message, currentPhase })
  );
  const data = await response.json();
  console.log(data);
  return data;
};

const getChatHistory = async (phase: number): Promise<ChatMessage[]> => {
  const response = await sendRequest(PATH + "history?phase=" + phase, "GET");
  const data = await response.json();
  return data;
};

const setOpenAIApiKey = async (openAiApiKey: string): Promise<boolean> => {
  const response = await sendRequest(
    PATH + "openAiApiKey",
    "POST",
    { "Content-Type": "application/json" },
    JSON.stringify({ openAiApiKey })
  );
  return response.status === 200;
};

const getOpenAIApiKey = async (): Promise<string> => {
  const response = await sendRequest(PATH + "openAiApiKey", "GET");
  const data = await response.text();
  return data;
};

const setGptModel = async (model: string): Promise<boolean> => {
  const response = await sendRequest(
    PATH + "model",
    "POST",
    { "Content-Type": "application/json" },
    JSON.stringify({ model })
  );
  return response.status === 200;
};

const getGptModel = async (): Promise<CHAT_MODELS> => {
  const response = await sendRequest(PATH + "model", "GET");
  const modelStr = await response.text();
  return modelStr as CHAT_MODELS;
};

export {
  clearChat,
  sendMessage,
  setOpenAIApiKey,
  getOpenAIApiKey,
  getGptModel,
  setGptModel,
  getChatHistory,
};
