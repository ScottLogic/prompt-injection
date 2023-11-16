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

function responseMock() {
  return {
    send: jest.fn(),
    status: jest.fn(() => ({
      send: jest.fn(),
    })),
  } as unknown as Response;
}

describe("handleChatToGPT", () => {
  test("GIVEN a valid message and level WHEN handleChatToGPT called THEN it should return a text reply", async () => {
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

    const res = responseMock();

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

  test("GIVEN missing message WHEN handleChatToGPT called THEN it should return 500 and error message", async () => {
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

    const res = responseMock();
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

  test("GIVEN an openai error is thrown WHEN handleChatToGPT called THEN it should return 500 and error message", async () => {
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
    const res = responseMock();

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

  test("GIVEN message exceeds character limit WHEN handleChatToGPT called THEN it should return 400 and error message", async () => {
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

    const res = responseMock();

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
  test("GIVEN a valid level WHEN handleGetChatHistory called THEN return chat history", () => {
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

    const res = responseMock();

    handleGetChatHistory(req, res);
    expect(res.send).toHaveBeenCalledWith(chatHistory);
  });

  test("GIVEN undefined level WHEN handleGetChatHistory called THEN return 400", () => {
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

    const res = responseMock();

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
  test("GIVEN a valid message WHEN handleAddToChatHistory called THEN message is added to chat history", () => {
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

    const res = responseMock();

    handleAddToChatHistory(req, res);

    expect(req.session.levelState[0].chatHistory.length).toEqual(3);
  });

  test("GIVEN invalid level WHEN handleAddToChatHistory called THEN returns 400", () => {
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
    const res = responseMock();

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
  test("GIVEN valid level WHEN handleClearChatHistory called THEN it sets chatHistory to empty", () => {
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
    const res = responseMock();
    handleClearChatHistory(req, res);
    expect(req.session.levelState[0].chatHistory.length).toEqual(0);
  });

  test("GIVEN invalid level WHEN handleClearChatHistory called THEN returns 400 ", () => {
    const req = {
      body: {
        level: undefined,
      },
      session: {
        levelState: [
          {
            chatHistory,
          },
        ],
      },
    } as unknown as OpenAiClearRequest;

    const res = responseMock();

    handleClearChatHistory(req, res);

    expect(res.statusCode).toBe(400);
  });
});
