/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/unbound-method */
import { Response } from "express";

import {
  handleAddToChatHistory,
  handleChatToGPT,
  handleClearChatHistory,
  handleGetChatHistory,
} from "@src/controller/chatController";
import { OpenAiAddHistoryRequest } from "@src/models/api/OpenAiAddHistoryRequest";
import { OpenAiChatRequest } from "@src/models/api/OpenAiChatRequest";
import { OpenAiClearRequest } from "@src/models/api/OpenAiClearRequest";
import { OpenAiGetHistoryRequest } from "@src/models/api/OpenAiGetHistoryRequest";
import {
  CHAT_MESSAGE_TYPE,
  ChatHistoryMessage,
  ChatModel,
} from "@src/models/chat";
import { DefenceInfo } from "@src/models/defence";
import { EmailInfo } from "@src/models/email";
import { LEVEL_NAMES } from "@src/models/level";

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

function responseMock() {
  return {
    send: jest.fn(),
    status: jest.fn(),
  } as unknown as Response;
}

describe("handleChatToGPT unit tests", () => {
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

  function errorResponseMock(message: string, transformedMessage?: string) {
    return {
      reply: message,
      defenceInfo: {
        blockedReason: message,
        isBlocked: true,
        alertedDefences: [],
        triggeredDefences: [],
      },
      transformedMessage: transformedMessage ?? "",
      wonLevel: false,
      isError: true,
    };
  }

  function openAiChatRequestMock(
    message?: string,
    level?: LEVEL_NAMES,
    chatHistory: ChatHistoryMessage[] = [],
    sentEmails: EmailInfo[] = [],
    defences: DefenceInfo[] = []
  ): OpenAiChatRequest {
    return {
      body: {
        currentLevel: level ?? undefined,
        message: message ?? "",
      },
      session: {
        levelState: [
          {
            level: level ?? undefined,
            chatHistory,
            sentEmails,
            defences,
          },
        ],
      },
    } as OpenAiChatRequest;
  }
  test("GIVEN a valid message and level WHEN handleChatToGPT called THEN it should return a text reply", async () => {
    const req = openAiChatRequestMock("Hello chatbot", 0);
    const res = responseMock();

    mockCreateChatCompletion.mockResolvedValueOnce(
      chatResponseAssistant("Howdy human!")
    );

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
    const req = openAiChatRequestMock("", 0);
    const res = responseMock();
    await handleChatToGPT(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith(errorResponseMock("Missing message"));
  });

  test("GIVEN an openai error is thrown WHEN handleChatToGPT called THEN it should return 500 and error message", async () => {
    const req = openAiChatRequestMock("hello", 0);
    const res = responseMock();

    // mock the api call throwing an error
    mockCreateChatCompletion.mockRejectedValueOnce(new Error("OpenAI error"));

    await handleChatToGPT(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith(
      errorResponseMock("Failed to get chatGPT reply", "hello")
    );
  });

  test("GIVEN message exceeds character limit WHEN handleChatToGPT called THEN it should return 400 and error message", async () => {
    const req = openAiChatRequestMock("x".repeat(16399), 0);
    const res = responseMock();

    await handleChatToGPT(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith(
      errorResponseMock("Message exceeds character limit")
    );
  });
});

describe("handleGetChatHistory", () => {
  function getRequestMock(
    level?: LEVEL_NAMES,
    chatHistory?: ChatHistoryMessage[]
  ) {
    return {
      query: {
        level: level ?? undefined,
      },
      session: {
        levelState: [
          {
            chatHistory: chatHistory ?? [],
          },
        ],
      },
    } as OpenAiGetHistoryRequest;
  }

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
    const req = getRequestMock(0, chatHistory);
    const res = responseMock();

    handleGetChatHistory(req, res);
    expect(res.send).toHaveBeenCalledWith(chatHistory);
  });

  test("GIVEN undefined level WHEN handleGetChatHistory called THEN return 400", () => {
    const req = getRequestMock();
    const res = responseMock();

    handleGetChatHistory(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith("Missing level");
  });
});

describe("handleAddToChatHistory", () => {
  function getAddHistoryRequestMock(
    message: string,
    level?: LEVEL_NAMES,
    chatHistory?: ChatHistoryMessage[]
  ) {
    return {
      body: {
        message,
        chatMessageType: CHAT_MESSAGE_TYPE.USER,
        level: level ?? undefined,
      },
      session: {
        levelState: [
          {
            chatHistory: chatHistory ?? [],
          },
        ],
      },
    } as OpenAiAddHistoryRequest;
  }

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
    const req = getAddHistoryRequestMock("tell me a story", 0, chatHistory);
    const res = responseMock();

    handleAddToChatHistory(req, res);

    expect(req.session.levelState[0].chatHistory.length).toEqual(3);
  });

  test("GIVEN invalid level WHEN handleAddToChatHistory called THEN returns 400", () => {
    const req = getAddHistoryRequestMock(
      "tell me a story",
      undefined,
      chatHistory
    );
    const res = responseMock();

    handleAddToChatHistory(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });
});

describe("handleClearChatHistory", () => {
  function openAiClearRequestMock(
    level?: LEVEL_NAMES,
    chatHistory?: ChatHistoryMessage[]
  ) {
    return {
      body: {
        level: level ?? undefined,
      },
      session: {
        levelState: [
          {
            chatHistory: chatHistory ?? [],
          },
        ],
      },
    } as OpenAiClearRequest;
  }

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
    const req = openAiClearRequestMock(0, chatHistory);
    const res = responseMock();
    handleClearChatHistory(req, res);
    expect(req.session.levelState[0].chatHistory.length).toEqual(0);
  });

  test("GIVEN invalid level WHEN handleClearChatHistory called THEN returns 400 ", () => {
    const req = openAiClearRequestMock(undefined, chatHistory);

    const res = responseMock();

    handleClearChatHistory(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });
});
