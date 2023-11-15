/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/unbound-method */
import {
  handleAddToChatHistory,
  handleChatToGPT,
  handleClearChatHistory,
  handleGetChatHistory,
} from "../../../src/controller/chatController";
import { OpenAiChatRequest } from "../../../src/models/api/OpenAiChatRequest";
import { Response } from "express";
import {
  CHAT_MESSAGE_TYPE,
  ChatHistoryMessage,
  ChatModel,
} from "../../../src/models/chat";
import { LEVEL_NAMES } from "../../../src/models/level";
import { EmailInfo } from "../../../src/models/email";
import { DefenceInfo } from "../../../src/models/defence";
import { GetRequestQueryLevel } from "../../../src/models/api/GetRequestQueryLevel";
import { OpenAiAddHistoryRequest } from "../../../src/models/api/OpenAiAddHistoryRequest";
import { OpenAiClearRequest } from "../../../src/models/api/OpenAiClearRequest";

declare module "express-session" {
  interface Session {
    initialised: boolean;
    chatModel: ChatModel;
    levelState: LevelState[];
  }
  interface LevelState {
    level: LEVEL_NAMES;
    chatHistory: ChatHistoryMessage[];
    defences: DefenceInfo[];
    sentEmails: EmailInfo[];
  }
}

// mock the api call
const mockCreateChatCompletion = jest.fn();
jest.mock("openai", () => ({
  OpenAIApi: jest.fn().mockImplementation(() => ({
    createChatCompletion: mockCreateChatCompletion,
  })),
  Configuration: jest.fn().mockImplementation(() => ({})),
}));

function chatResponseAssistant(content: string) {
  return {
    data: {
      choices: [
        {
          message: {
            role: "assistant",
            content,
          },
        },
      ],
    },
  };
}

describe("handleChatToGPT", () => {
  test("should return a response for a valid message and level", async () => {
    const req = {
      body: {
        message: "Hello chatbot",
        currentLevel: 0,
      },
      session: {
        levelState: [
          {
            level: 0,
            chatHistory: [],
            defences: [],
            sentEmails: [],
          },
        ],
      },
    } as unknown as OpenAiChatRequest;

    mockCreateChatCompletion.mockResolvedValueOnce(
      chatResponseAssistant("Howdy human!")
    );

    const res = {
      send: jest.fn(),
      status: jest.fn(() => ({
        send: jest.fn(),
      })),
    } as unknown as Response;

    await handleChatToGPT(req, res);

    expect(res.send).toHaveBeenCalledWith({
      reply: "Howdy human!",
      defenceInfo: {
        blockedReason: "",
        isBlocked: false,
        alertedDefences: [],
        triggeredDefences: [],
      },
      transformedMessage: "Hello chatbot",
      wonLevel: false,
      isError: false,
    });
  });

  test("should return error response on missing message", async () => {
    const req = {
      body: {
        message: "",
        currentLevel: 0,
      },
      session: {
        levelState: [
          {
            level: 0,
            chatHistory: [],
            defences: [],
            sentEmails: [],
          },
        ],
      },
    } as unknown as OpenAiChatRequest;

    const res = {
      send: jest.fn(),
      status: jest.fn(() => ({
        send: jest.fn(),
      })),
    } as unknown as Response;
    await handleChatToGPT(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      reply: "Missing message",
      defenceInfo: {
        blockedReason: "Missing message",
        isBlocked: true,
        alertedDefences: [],
        triggeredDefences: [],
      },
      transformedMessage: "",
      wonLevel: false,
      isError: true,
    });
  });

  test("should return error response on openai error", async () => {
    const req = {
      body: {
        message: "hello",
        currentLevel: 0,
      },
      session: {
        levelState: [
          {
            level: 0,
            chatHistory: [],
            defences: [],
            sentEmails: [],
          },
        ],
      },
    } as unknown as OpenAiChatRequest;
    const res = {
      send: jest.fn(),
      status: jest.fn(() => ({
        send: jest.fn(),
      })),
    } as unknown as Response;

    // mock the api call throwing an error
    mockCreateChatCompletion.mockRejectedValueOnce(new Error("OpenAI error"));

    await handleChatToGPT(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      reply: "Failed to get chatGPT reply",
      defenceInfo: {
        blockedReason: "Failed to get chatGPT reply",
        isBlocked: true,
        alertedDefences: [],
        triggeredDefences: [],
      },
      transformedMessage: "hello",
      wonLevel: false,
      isError: true,
    });
  });

  test("should return error message for exceeding character limit error", async () => {
    const req = {
      body: {
        message: "x".repeat(16399),
        currentLevel: 0,
      },
      session: {
        levelState: [
          {
            level: 0,
            chatHistory: [],
            defences: [],
            sentEmails: [],
          },
        ],
      },
    } as unknown as OpenAiChatRequest;
    const res = {
      send: jest.fn(),
      status: jest.fn(() => ({
        send: jest.fn(),
      })),
    } as unknown as Response;

    await handleChatToGPT(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      reply: "Message exceeds character limit",
      defenceInfo: {
        blockedReason: "Message exceeds character limit",
        isBlocked: true,
        alertedDefences: [],
        triggeredDefences: [],
      },
      transformedMessage: "",
      wonLevel: false,
      isError: true,
    });
  });
});

describe("handleGetChatHistory", () => {
  const chatHistory: ChatHistoryMessage[] = [
    {
      completion: { role: "system", content: "You are a helpful chatbot" },
      chatMessageType: CHAT_MESSAGE_TYPE.SYSTEM,
    },
    {
      completion: { role: "assistant", content: "Hello human" },
      chatMessageType: CHAT_MESSAGE_TYPE.BOT,
    },
    {
      completion: { role: "user", content: "How are you?" },
      chatMessageType: CHAT_MESSAGE_TYPE.SYSTEM,
    },
  ];
  test("should return chat history on valid level ", () => {
    const req = {
      query: {
        level: 0,
      },
      session: {
        levelState: [
          {
            chatHistory,
          },
        ],
      },
    } as unknown as GetRequestQueryLevel;

    const res = {
      send: jest.fn(),
      statusCode: 200,
    } as unknown as Response;

    handleGetChatHistory(req, res);
    expect(res.send).toHaveBeenCalledWith(chatHistory);
  });

  test("should return error on empty level", () => {
    const req = {
      query: {
        level: undefined,
      },
      session: {
        levelState: [
          {
            chatHistory: [],
          },
        ],
      },
    } as unknown as GetRequestQueryLevel;

    const res = {
      send: jest.fn(),
      statusCode: 200,
    } as unknown as Response;

    handleGetChatHistory(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.send).toHaveBeenCalledWith("Missing level");
  });
});

describe("handleAddToChatHistory", () => {
  const chatHistory: ChatHistoryMessage[] = [
    {
      completion: { role: "system", content: "You are a helpful chatbot" },
      chatMessageType: CHAT_MESSAGE_TYPE.SYSTEM,
    },
    {
      completion: { role: "assistant", content: "Hello human" },
      chatMessageType: CHAT_MESSAGE_TYPE.BOT,
    },
  ];
  test("should add message to chat history", () => {
    const req = {
      body: {
        message: "tell me a story",
        chatMessageType: CHAT_MESSAGE_TYPE.USER,
        level: 0,
      },
      session: {
        levelState: [
          {
            chatHistory,
          },
        ],
      },
    } as unknown as OpenAiAddHistoryRequest;

    const res = {
      send: jest.fn(),
      statusCode: 200,
    } as unknown as Response;

    handleAddToChatHistory(req, res);

    expect(req.session.levelState[0].chatHistory.length).toEqual(3);
  });

  test("should return error on invalid level", () => {
    const req = {
      body: {
        message: "tell me a story",
        chatMessageType: CHAT_MESSAGE_TYPE.USER,
        level: undefined,
      },
      session: {
        levelState: [
          {
            chatHistory,
          },
        ],
      },
    } as unknown as OpenAiAddHistoryRequest;
    const res = {
      send: jest.fn(),
    } as unknown as Response;

    handleAddToChatHistory(req, res);

    expect(res.statusCode).toBe(400);
  });
});

describe("handleClearChatHistory", () => {
  const chatHistory: ChatHistoryMessage[] = [
    {
      completion: { role: "system", content: "You are a helpful chatbot" },
      chatMessageType: CHAT_MESSAGE_TYPE.SYSTEM,
    },
    {
      completion: { role: "assistant", content: "Hello human" },
      chatMessageType: CHAT_MESSAGE_TYPE.BOT,
    },
  ];
  test("should clear chat history", () => {
    const req = {
      body: {
        level: 0,
      },
      session: {
        levelState: [
          {
            chatHistory,
          },
        ],
      },
    } as unknown as OpenAiClearRequest;
    const res = {
      send: jest.fn(),
    } as unknown as Response;
    handleClearChatHistory(req, res);
    expect(req.session.levelState[0].chatHistory.length).toEqual(0);
  });

  test("should return error on invalid level", () => {
    const req = {
      body: {
        level: 0,
      },
      session: {
        levelState: [
          {
            chatHistory,
          },
        ],
      },
    } as unknown as OpenAiClearRequest;
    const res = {
      send: jest.fn(),
    } as unknown as Response;
    handleClearChatHistory(req, res);

    expect(res.statusCode).toBe(400);
  });
});
