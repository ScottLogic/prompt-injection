const { initOpenAi, chatGptSendMessage } = require("../../src/openai");
const { OpenAIApi } = require("openai");

// Mock the OpenAIApi module
jest.mock("openai");
const mockCreateChatCompletion = jest.fn();
// Create a mock instance
OpenAIApi.mockImplementation(() => {
  return {
    createChatCompletion: mockCreateChatCompletion,
  };
});

test("GIVEN OpenAI not initialised WHEN sending message THEN error is thrown", async () => {
  const message = "Hello";
  const session = {
    activeDefences: [],
    chatHistory: [],
    sentEmails: [],
  };
  await expect(chatGptSendMessage(message, session)).rejects.toThrow(
    "OpenAI has not been initialised"
  );
});

test("GIVEN OpenAI initialised WHEN sending message THEN reply is returned", async () => {
  const message = "Hello";
  const session = {
    activeDefences: [],
    chatHistory: [],
    sentEmails: [],
  };

  // Mock the createChatCompletion function
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

  // initialise OpenAI
  initOpenAi();
  // send the message
  const reply = await chatGptSendMessage(message, session);
  expect(reply).toBeDefined();
  expect(reply.reply).toBe("Hi");
  // check the chat history has been updated
  expect(session.chatHistory.length).toBe(2);
  expect(session.chatHistory[0].role).toBe("user");
  expect(session.chatHistory[0].content).toBe("Hello");
  expect(session.chatHistory[1].role).toBe("assistant");
  expect(session.chatHistory[1].content).toBe("Hi");

  // restore the mock
  mockCreateChatCompletion.mockRestore();
});

test("GIVEN SYSTEM_ROLE defence is active WHEN sending message THEN system role is added to chat history", async () => {
  const message = "Hello";
  const session = {
    activeDefences: ["SYSTEM_ROLE"],
    chatHistory: [],
    sentEmails: [],
  };

  // set the system role prompt
  process.env.SYSTEM_ROLE = "You are a helpful assistant";

  // Mock the createChatCompletion function
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

  // initialise OpenAI
  initOpenAi();
  // send the message
  const reply = await chatGptSendMessage(message, session);
  expect(reply).toBeDefined();
  expect(reply.reply).toBe("Hi");
  // check the chat history has been updated
  expect(session.chatHistory.length).toBe(3);
  // system role is added to the start of the chat history
  expect(session.chatHistory[0].role).toBe("system");
  expect(session.chatHistory[0].content).toBe(process.env.SYSTEM_ROLE);
  expect(session.chatHistory[1].role).toBe("user");
  expect(session.chatHistory[1].content).toBe("Hello");
  expect(session.chatHistory[2].role).toBe("assistant");
  expect(session.chatHistory[2].content).toBe("Hi");

  // restore the mock
  mockCreateChatCompletion.mockRestore();
});

test("GIVEN SYSTEM_ROLE defence is active WHEN sending message THEN system role is added to the start of the chat history", async () => {
  const message = "Hello";
  const session = {
    activeDefences: ["SYSTEM_ROLE"],
    // add in some chat history
    chatHistory: [
      {
        role: "user",
        content: "I'm a user",
      },
      {
        role: "assistant",
        content: "I'm an assistant",
      },
    ],
    sentEmails: [],
  };

  // set the system role prompt
  process.env.SYSTEM_ROLE = "You are a helpful assistant";

  // Mock the createChatCompletion function
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

  // initialise OpenAI
  initOpenAi();
  // send the message
  const reply = await chatGptSendMessage(message, session);
  expect(reply).toBeDefined();
  expect(reply.reply).toBe("Hi");
  // check the chat history has been updated
  expect(session.chatHistory.length).toBe(5);
  // system role is added to the start of the chat history
  expect(session.chatHistory[0].role).toBe("system");
  expect(session.chatHistory[0].content).toBe(process.env.SYSTEM_ROLE);
  // rest of the chat history is in order
  expect(session.chatHistory[1].role).toBe("user");
  expect(session.chatHistory[1].content).toBe("I'm a user");
  expect(session.chatHistory[2].role).toBe("assistant");
  expect(session.chatHistory[2].content).toBe("I'm an assistant");
  expect(session.chatHistory[3].role).toBe("user");
  expect(session.chatHistory[3].content).toBe("Hello");
  expect(session.chatHistory[4].role).toBe("assistant");
  expect(session.chatHistory[4].content).toBe("Hi");

  // restore the mock
  mockCreateChatCompletion.mockRestore();
});

test("GIVEN SYSTEM_ROLE defence is inactive WHEN sending message THEN system role is removed from the chat history", async () => {
  const message = "Hello";
  const session = {
    activeDefences: [],
    // add in some chat history with a system role
    chatHistory: [
      {
        role: "system",
        content: "You are a helpful assistant",
      },
      {
        role: "user",
        content: "I'm a user",
      },
      {
        role: "assistant",
        content: "I'm an assistant",
      },
    ],
    sentEmails: [],
  };

  // Mock the createChatCompletion function
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

  // initialise OpenAI
  initOpenAi();
  // send the message
  const reply = await chatGptSendMessage(message, session);
  expect(reply).toBeDefined();
  expect(reply.reply).toBe("Hi");
  // check the chat history has been updated
  expect(session.chatHistory.length).toBe(4);
  // system role is removed from the start of the chat history
  // rest of the chat history is in order
  expect(session.chatHistory[0].role).toBe("user");
  expect(session.chatHistory[0].content).toBe("I'm a user");
  expect(session.chatHistory[1].role).toBe("assistant");
  expect(session.chatHistory[1].content).toBe("I'm an assistant");
  expect(session.chatHistory[2].role).toBe("user");
  expect(session.chatHistory[2].content).toBe("Hello");
  expect(session.chatHistory[3].role).toBe("assistant");
  expect(session.chatHistory[3].content).toBe("Hi");

  // restore the mock
  mockCreateChatCompletion.mockRestore();
});
