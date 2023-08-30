import { sendRequest } from "./backendService";
import {
  CHAT_MESSAGE_TYPE,
  CHAT_MODELS,
  ChatHistoryMessage,
  ChatMessage,
  ChatResponse,
} from "../models/chat";
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
  // convert to ChatMessage object
  const chatMessages: ChatMessage[] = data.map(
    (message: ChatHistoryMessage) => {
      switch (message.chatMessageType) {
        case CHAT_MESSAGE_TYPE.BOT:
          return {
            message: message.completion?.content,
            type: CHAT_MESSAGE_TYPE.BOT,
          };
        case CHAT_MESSAGE_TYPE.BOT_BLOCKED:
          return {
            message: message.infoMessage,
            type: CHAT_MESSAGE_TYPE.BOT_BLOCKED,
            defenceInfo: {
              blockedReason: message.infoMessage,
              isBlocked: true,
              triggeredDefences: [],
            },
          };
        case CHAT_MESSAGE_TYPE.USER:
          return {
            message: message.completion?.content || message.infoMessage,
            type: CHAT_MESSAGE_TYPE.USER,
          };
        case CHAT_MESSAGE_TYPE.USER_TRANSFORMED:
          return {
            message: message.completion?.content,
            type: CHAT_MESSAGE_TYPE.USER_TRANSFORMED,
          };
        case CHAT_MESSAGE_TYPE.INFO:
          return {
            message: message.infoMessage,
            type: message.chatMessageType,
          };
        case CHAT_MESSAGE_TYPE.PHASE_INFO:
          return {
            message: message.infoMessage,
            type: CHAT_MESSAGE_TYPE.PHASE_INFO,
          };
        case CHAT_MESSAGE_TYPE.DEFENCE_ALERTED:
          return {
            message: message.infoMessage,
            type: CHAT_MESSAGE_TYPE.DEFENCE_ALERTED,
          };
        case CHAT_MESSAGE_TYPE.DEFENCE_TRIGGERED:
          return {
            message: message.infoMessage,
            type: CHAT_MESSAGE_TYPE.DEFENCE_TRIGGERED,
          };
        default:
          // don't show system role messages or function calls in the chat box
          return null;
      }
    }
  );
  return chatMessages.filter((message) => message !== null);
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

const addMessageToChatHistory = async (
  message: string,
  chatMessageType: CHAT_MESSAGE_TYPE,
  phase: number
) => {
  const response = await sendRequest(
    PATH + "addHistory",
    "POST",
    { "Content-Type": "application/json" },
    JSON.stringify({
      message: message,
      chatMessageType: chatMessageType,
      phase: phase,
    })
  );
  return response.status === 200;
};

export {
  clearChat,
  sendMessage,
  setOpenAIApiKey,
  getOpenAIApiKey,
  getGptModel,
  setGptModel,
  getChatHistory,
  addMessageToChatHistory,
};
