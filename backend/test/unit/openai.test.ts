import { OpenAIApi } from "openai";
import { validateApiKey, setOpenAiApiKey } from "../../src/openai";
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

afterEach(() => {
  jest.clearAllMocks();
});
