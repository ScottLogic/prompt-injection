import { sendRequest } from "./backendService";
import {
  CHAT_MESSAGE_TYPE,
  ChatHistoryMessage,
  ChatMessage,
  ChatModel,
  ChatResponse,
  MODEL_CONFIG,
} from "../models/chat";
import { LEVEL_NAMES } from "../models/level";

const PATH = "openai/";

async function clearChat(level: number) {
  const response = await sendRequest(
    `${PATH}clear`,
    "POST",
    {
      "Content-Type": "application/json",
    },
    JSON.stringify({ level })
  );
  return response.status === 200;
}

async function sendMessage(message: string, currentLevel: LEVEL_NAMES) {
  const response = await sendRequest(
    `${PATH}chat`,
    "POST",
    { "Content-Type": "application/json" },
    JSON.stringify({ message, currentLevel })
  );
  const data = (await response.json()) as ChatResponse;
  console.log(data);
  return data;
}

async function getChatHistory(level: number): Promise<ChatMessage[]> {
  const response = await sendRequest(`${PATH}history?level=${level}`, "GET");
  const chatHistory = (await response.json()) as ChatHistoryMessage[];
  // convert to ChatMessage object
  const chatMessages: ChatMessage[] = [];
  chatHistory.forEach((message) => {
    switch (message.chatMessageType) {
      case CHAT_MESSAGE_TYPE.BOT:
        chatMessages.push({
          message: message.completion?.content ?? "",
          type: CHAT_MESSAGE_TYPE.BOT,
        });
        break;
      case CHAT_MESSAGE_TYPE.BOT_BLOCKED:
        chatMessages.push({
          message: message.infoMessage ?? "",
          type: CHAT_MESSAGE_TYPE.BOT_BLOCKED,
        });
        break;
      case CHAT_MESSAGE_TYPE.USER:
        chatMessages.push({
          message: message.completion?.content ?? message.infoMessage ?? "",
          type: CHAT_MESSAGE_TYPE.USER,
        });
        break;
      case CHAT_MESSAGE_TYPE.USER_TRANSFORMED:
        chatMessages.push({
          message: message.completion?.content ?? "",
          type: CHAT_MESSAGE_TYPE.USER_TRANSFORMED,
        });
        break;
      case CHAT_MESSAGE_TYPE.INFO:
        chatMessages.push({
          message: message.infoMessage ?? "",
          type: message.chatMessageType,
        });
        break;
      case CHAT_MESSAGE_TYPE.LEVEL_INFO:
        chatMessages.push({
          message: message.infoMessage ?? "",
          type: CHAT_MESSAGE_TYPE.LEVEL_INFO,
        });
        break;
      case CHAT_MESSAGE_TYPE.DEFENCE_ALERTED:
        chatMessages.push({
          message: message.infoMessage ?? "",
          type: CHAT_MESSAGE_TYPE.DEFENCE_ALERTED,
        });
        break;
      case CHAT_MESSAGE_TYPE.DEFENCE_TRIGGERED:
        chatMessages.push({
          message: message.infoMessage ?? "",
          type: CHAT_MESSAGE_TYPE.DEFENCE_TRIGGERED,
        });
        break;
      case CHAT_MESSAGE_TYPE.ERROR_MSG:
        chatMessages.push({
          message: message.infoMessage ?? "",
          type: CHAT_MESSAGE_TYPE.ERROR_MSG,
        });
        break;
      default:
        break;
    }
  });
  return chatMessages;
}

async function setGptModel(model: string): Promise<boolean> {
  const response = await sendRequest(
    `${PATH}model`,
    "POST",
    { "Content-Type": "application/json" },
    JSON.stringify({ model })
  );
  return response.status === 200;
}

async function configureGptModel(
  configId: MODEL_CONFIG,
  value: number
): Promise<boolean> {
  const response = await sendRequest(
    `${PATH}model/configure`,
    "POST",
    { "Content-Type": "application/json" },
    JSON.stringify({ configId, value })
  );
  return response.status === 200;
}

async function getGptModel(): Promise<ChatModel> {
  const response = await sendRequest(`${PATH}model`, "GET");
  return (await response.json()) as ChatModel;
}

async function addMessageToChatHistory(
  message: string,
  chatMessageType: CHAT_MESSAGE_TYPE,
  level: number
) {
  const response = await sendRequest(
    `${PATH}addHistory`,
    "POST",
    { "Content-Type": "application/json" },
    JSON.stringify({
      message,
      chatMessageType,
      level,
    })
  );
  return response.status === 200;
}

export {
  clearChat,
  sendMessage,
  configureGptModel,
  getGptModel,
  setGptModel,
  getChatHistory,
  addMessageToChatHistory,
};
