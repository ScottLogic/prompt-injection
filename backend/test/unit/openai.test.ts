import { ChatCompletionRequestMessage, OpenAIApi } from "openai";
import {
  validateApiKey,
  setOpenAiApiKey,
  filterChatHistoryByMaxTokens,
} from "../../src/openai";
import { initQAModel } from "../../src/langchain";
import { CHAT_MODELS } from "../../src/models/chat";

// Define a mock implementation for the createChatCompletion method
const mockCreateChatCompletion = jest.fn();
// Mock the OpenAIApi class
jest.mock("openai", () => ({
  OpenAIApi: jest.fn().mockImplementation(() => ({
    createChatCompletion: mockCreateChatCompletion,
  })),
  Configuration: jest.fn().mockImplementation(() => ({})),
}));

jest.mock("../../src/openai", () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const originalModule = jest.requireActual("../../src/openai");
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return {
    ...originalModule,
    initOpenAi: jest.fn(),
  };
});

jest.mock("../../src/langchain", () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const originalModule = jest.requireActual("../../src/langchain");
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return {
    ...originalModule,
    initQAModel: jest.fn(),
    initDocumentVectors: jest.fn(),
  };
});

beforeEach(() => {
  // clear environment variables
  process.env = {};
});

test("GIVEN a valid API key WHEN calling validateApiKey THEN it should return true", async () => {
  const result = await validateApiKey("sk-1234567", CHAT_MODELS.GPT_4);
  expect(result).toBe(true);
});

test("GIVEN an invalid API key WHEN calling validateApiKey THEN it should return false", async () => {
  mockCreateChatCompletion.mockRejectedValueOnce(new Error("Invalid API key"));
  const result = await validateApiKey("invalid-api-key", CHAT_MODELS.GPT_4);
  expect(result).toBe(false);
});

test("GIVEN a valid API key WHEN calling setOpenAiApiKey THEN it should set the API key and initialize models", async () => {
  const openAiApiKey = "sk-1234567";
  const result = await setOpenAiApiKey(openAiApiKey, CHAT_MODELS.GPT_4);

  expect(result).toBe(true);
  // once to validate, once to initalize
  expect(OpenAIApi).toHaveBeenCalledTimes(2);
});

test("GIVEN an invalid API key WHEN calling setOpenAiApiKey THEN it should set the API key to empty", async () => {
  mockCreateChatCompletion.mockRejectedValueOnce(new Error("Invalid API key"));
  const openAiApiKey = "invalid-api-key";
  // Call the function
  const result = await setOpenAiApiKey(openAiApiKey, CHAT_MODELS.GPT_4);

  // Check if the API key and models are reset correctly
  expect(result).toBe(false);
  // once only to validate
  expect(OpenAIApi).toHaveBeenCalledTimes(1);
  expect(initQAModel).not.toHaveBeenCalled();
});

test("GIVEN chat history exceeds max token number WHEN applying filter THEN it should return the filtered chat history", () => {
  const maxTokens = 121;
  const chatHistory: ChatCompletionRequestMessage[] = [
    {
      role: "user",
      content: "Hello, my name is Bob.", // 14 tokens
    },

    {
      role: "assistant",
      content: "Hello, how are you?", // 13 tokens
    },
    {
      role: "user",
      content: "Send an email to my boss to tell him I quit.", // 19 tokens
    },
    {
      role: "assistant",
      function_call: {
        arguments:
          '{\n  "address": "boss@example.com",\n  "subject": "Resignation",\n  "body": "Dear Boss, \\n\\nI am writing to formally resign from my position at the company, effective immediately. \\n\\nBest regards, \\nBob",\n  "confirmed": true\n}',
        name: "sendEmail", // 75 tokens }
      },
    },
    {
      role: "assistant",
      content: "I have sent the email.", // 13 tokens
    },
  ];

  // expect that the first message is trimmed
  const expectedFilteredChatHistory: ChatCompletionRequestMessage[] = [
    {
      role: "assistant",
      content: "Hello, how are you?", // 12 tokens
    },
    {
      role: "user",
      content: "Send an email to my boss to tell him I quit.", // 19 tokens
    },
    {
      role: "assistant",
      function_call: {
        arguments:
          '{\n  "address": "boss@example.com",\n  "subject": "Resignation",\n  "body": "Dear Boss, \\n\\nI am writing to formally resign from my position at the company, effective immediately. \\n\\nBest regards, \\nBob",\n  "confirmed": true\n}',
        name: "sendEmail", // 75 tokens }
      },
    },
    {
      role: "assistant",
      content: "I have sent the email.", // 6 tokens
    },
  ];

  const filteredChatHistory = filterChatHistoryByMaxTokens(
    chatHistory,
    maxTokens
  );

  expect(filteredChatHistory.length).toBe(4);
  expect(filteredChatHistory).toEqual(expectedFilteredChatHistory);
});

test("GIVEN chat history does not exceed max token number WHEN applying filter THEN it should return the original chat history", () => {
  const maxTokens = 1000;
  const chatHistory: ChatCompletionRequestMessage[] = [
    {
      role: "user",
      content: "Hello, my name is Bob.", // 14 tokens
    },

    {
      role: "assistant",
      content: "Hello, how are you?", // 13 tokens
    },
    {
      role: "user",
      content: "Send an email to my boss to tell him I quit.", // 19 tokens
    },
    {
      role: "assistant",
      function_call: {
        arguments:
          '{\n  "address": "boss@example.com",\n  "subject": "Resignation",\n  "body": "Dear Boss, \\n\\nI am writing to formally resign from my position at the company, effective immediately. \\n\\nBest regards, \\nBob",\n  "confirmed": true\n}',
        name: "sendEmail", // 75 tokens }
      },
    },
    {
      role: "assistant",
      content: "I have sent the email.", // 13 tokens
    },
  ];

  const filteredChatHistory = filterChatHistoryByMaxTokens(
    chatHistory,
    maxTokens
  );
  expect(filteredChatHistory).toEqual(chatHistory);
});

test("GIVEN chat history exceeds max token number WHEN applying filter AND there is a system role in chat history THEN it should return the filtered chat history", () => {
  const maxTokens = 121;

  const chatHistory: ChatCompletionRequestMessage[] = [
    {
      role: "system",
      content: "You are a helpful chatbot.", // 14 tokens
    },
    {
      role: "user",
      content: "Hello, my name is Bob.", // 14 tokens
    },

    {
      role: "assistant",
      content: "Hello, how are you?", // 13 tokens
    },
    {
      role: "user",
      content: "Send an email to my boss to tell him I quit.", // 19 tokens
    },
    {
      role: "assistant",
      function_call: {
        arguments:
          '{\n  "address": "boss@example.com",\n  "subject": "Resignation",\n  "body": "Dear Boss, \\n\\nI am writing to formally resign from my position at the company, effective immediately. \\n\\nBest regards, \\nBob",\n  "confirmed": true\n}',
        name: "sendEmail", // 75 tokens }
      },
    },
    {
      role: "assistant",
      content: "I have sent the email.", // 13 tokens
    },
  ];

  // expect that the first message is trimmed
  const expectedFilteredChatHistory: ChatCompletionRequestMessage[] = [
    {
      role: "system",
      content: "You are a helpful chatbot.", // 14 tokens
    },
    {
      role: "user",
      content: "Send an email to my boss to tell him I quit.", // 19 tokens
    },
    {
      role: "assistant",
      function_call: {
        arguments:
          '{\n  "address": "boss@example.com",\n  "subject": "Resignation",\n  "body": "Dear Boss, \\n\\nI am writing to formally resign from my position at the company, effective immediately. \\n\\nBest regards, \\nBob",\n  "confirmed": true\n}',
        name: "sendEmail", // 75 tokens }
      },
    },
    {
      role: "assistant",
      content: "I have sent the email.", // 6 tokens
    },
  ];

  const filteredChatHistory = filterChatHistoryByMaxTokens(
    chatHistory,
    maxTokens
  );

  expect(filteredChatHistory.length).toBe(4);
  expect(filteredChatHistory).toEqual(expectedFilteredChatHistory);
});

test("GIVEN chat history most recent message exceeds max tokens alone WHEN applying filter THEN it should return this message", () => {
  const maxTokens = 30;
  const chatHistory: ChatCompletionRequestMessage[] = [
    {
      role: "user",
      content:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. ",
    },
  ];
  const filteredChatHistory = filterChatHistoryByMaxTokens(
    chatHistory,
    maxTokens
  );
  expect(filteredChatHistory).toEqual(chatHistory);
});

afterEach(() => {
  jest.clearAllMocks();
});
