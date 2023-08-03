const { OpenAIApi } = require("openai");
const {
  validateApiKey,
  setOpenAiApiKey,
  initOpenAi,
} = require("../../src/openai");
const { initQAModel } = require("../../src/documents");

// Mock the OpenAIApi module
jest.mock("openai");
// Create a mock instance
const mockCreateChatCompletion = jest.fn();
OpenAIApi.mockImplementation(() => {
  return {
    createChatCompletion: mockCreateChatCompletion,
  };
});

const mockInitOpenAi = jest.fn();
jest.mock("../../src/openai", () => {
  const originalModule = jest.requireActual("../../src/openai");
  return {
    ...originalModule,
    initOpenAi: jest.fn(),
  };
});

jest.mock("../../src/documents");
initQAModel.mockImplementation(() => {
  return {
    initQAModel: jest.fn(),
  };
});

test("GIVEN a valid API key WHEN calling validateApiKey THEN it should return true", async () => {
  mockCreateChatCompletion.mockResolvedValueOnce({
    data: {
      choices: [
        {
          message: {
            role: "assistant",
            content: "Hi",
          },
        },
      ],
    },
  });
  const result = await validateApiKey("sk-1234567");
  expect(result).toBe(true);
  mockCreateChatCompletion.mockRestore();
});

test("GIVEN an invalid API key WHEN calling validateApiKey THEN it should return false", async () => {
  mockCreateChatCompletion.mockRejectedValueOnce(new Error("Invalid API key"));
  const result = await validateApiKey("invalid-api-key");
  expect(result).toBe(false);
});

test("GIVEN a valid API key WHEN calling setOpenAiApiKey THEN it should set the API key and initialize models", async () => {
  const session = { apiKey: "" };
  const apiKey = "sk-1234567";

  const result = await setOpenAiApiKey(session, apiKey);

  expect(result).toBe(true);
  expect(session.apiKey).toBe(apiKey);
  // once to validate, once to initalize
  expect(OpenAIApi).toHaveBeenCalledTimes(2);
  expect(initQAModel).toHaveBeenCalled();
});

test("GIVEN an invalid API key WHEN calling setOpenAiApiKey THEN it should set the API key to empty", async () => {
  mockCreateChatCompletion.mockRejectedValueOnce(new Error("Invalid API key"));
  const session = { apiKey: "valid-api-key" };
  const apiKey = "invalid-api-key";

  // Call the function
  const result = await setOpenAiApiKey(session, apiKey);

  // Check if the API key and models are reset correctly
  expect(result).toBe(false);
  expect(session.apiKey).toBe("");
  // once only to validate
  expect(OpenAIApi).toHaveBeenCalledTimes(1);
  expect(initQAModel).not.toHaveBeenCalled();
});

afterEach(() => {
  OpenAIApi.mockClear();
  jest.clearAllMocks();
});
