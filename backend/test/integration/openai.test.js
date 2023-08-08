const { activateDefence, getInitialDefences } = require("../../src/defence");
const { initOpenAi, chatGptSendMessage } = require("../../src/openai");
const { OpenAIApi } = require("openai");
const { queryPromptEvaluationModel } = require("../../src/langchain");

// Mock the OpenAIApi module
jest.mock("openai");
const mockCreateChatCompletion = jest.fn();
// Create a mock instance
OpenAIApi.mockImplementation(() => {
  return {
    createChatCompletion: mockCreateChatCompletion,
  };
});

// bypass the prompt evaluation model
jest.mock("../../src/langchain");
const mockEvalReturn = jest.fn();
queryPromptEvaluationModel.mockImplementation(() => {
  return mockEvalReturn;
});
beforeEach(() => {
  mockEvalReturn.mockResolvedValueOnce({ isMalicious: false, reason: "" });
});

test("GIVEN OpenAI not initialised WHEN sending message THEN error is thrown", async () => {
  const message = "Hello";
  const session = {
    defences: [],
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
    defences: [],
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
  // set the system role prompt
  process.env.SYSTEM_ROLE = "You are a helpful assistant";

  const message = "Hello";
  const session = {
    defences: getInitialDefences(),
    chatHistory: [],
    sentEmails: [],
  };
  session.defences = activateDefence("SYSTEM_ROLE", session.defences);

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
  // set the system role prompt
  process.env.SYSTEM_ROLE = "You are a helpful assistant";

  const message = "Hello";
  const session = {
    defences: getInitialDefences(),
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
  // activate the SYSTEM_ROLE defence
  session.defences = activateDefence("SYSTEM_ROLE", session.defences);

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
    defences: [{ id: "SYSTEM_ROLE", isActive: false }],
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

test(
  "GIVEN SYSTEM_ROLE defence is active AND the system role is already in the chat history " +
    "WHEN sending message THEN system role is not re-added to the chat history",
  async () => {
    const message = "Hello";
    const session = {
      defences: [{ id: "SYSTEM_ROLE", isActive: true }],
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
  }
);

test(
  "GIVEN the assistant sends an email AND EMAIL_WHITELIST is inactive AND email is not in the whitelist" +
    "WHEN sending message " +
    "THEN email is sent AND message is not blocked AND EMAIL_WHITELIST defence is triggered",
  async () => {
    const message = "Send an email to bob@example.com saying hi";
    const session = {
      defences: [
        {
          id: "EMAIL_WHITELIST",
          isActive: false,
          configutation: [{ id: "whitelist", value: "" }],
        },
      ],
      chatHistory: [],
      sentEmails: [],
    };

    // set email whitelist
    process.env.EMAIL_WHITELIST = "";

    // Mock the createChatCompletion function
    mockCreateChatCompletion
      // first time sendEmail is called
      .mockResolvedValueOnce({
        data: {
          choices: [
            {
              message: {
                role: "assistant",
                content: null,
                function_call: {
                  name: "sendEmail",
                  arguments:
                    '{\n  "address": "bob@example.com",\n  "subject": "Hi",\n  "body": "Hello"\n}',
                },
              },
            },
          ],
        },
      })
      // second time assistant sends a message
      .mockResolvedValueOnce({
        data: {
          choices: [
            {
              message: {
                role: "assistant",
                content: "Email sent",
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
    expect(reply.reply).toBe("Email sent");
    // check that the email has been sent
    expect(session.sentEmails.length).toBe(1);
    expect(session.sentEmails[0].address).toBe("bob@example.com");
    expect(session.sentEmails[0].subject).toBe("Hi");
    expect(session.sentEmails[0].content).toBe("Hello");
    // message is not blocked
    expect(reply.defenceInfo.blocked).toBe(false);
    // EMAIL_WHITELIST defence is triggered
    expect(reply.defenceInfo.triggeredDefences.length).toBe(1);
    expect(reply.defenceInfo.triggeredDefences[0]).toBe("EMAIL_WHITELIST");

    // restore the mock
    mockCreateChatCompletion.mockRestore();
  }
);

test(
  "GIVEN the assistant sends an email AND EMAIL_WHITELIST is active AND email is not in the whitelist" +
    "WHEN sending message " +
    "THEN email is not sent AND message is blocked AND EMAIL_WHITELIST defence is triggered",
  async () => {
    const message = "Send an email to bob@example.com saying hi";
    const session = {
      defences: [
        {
          id: "EMAIL_WHITELIST",
          isActive: true,
          configutation: [{ id: "whitelist", value: "" }],
        },
      ],
      chatHistory: [],
      sentEmails: [],
    };

    // set email whitelist
    process.env.EMAIL_WHITELIST = "";

    // Mock the createChatCompletion function
    mockCreateChatCompletion
      // first time sendEmail is called
      .mockResolvedValueOnce({
        data: {
          choices: [
            {
              message: {
                role: "assistant",
                content: null,
                function_call: {
                  name: "sendEmail",
                  arguments:
                    '{\n  "address": "bob@example.com",\n  "subject": "Hi",\n  "body": "Hello"\n}',
                },
              },
            },
          ],
        },
      })
      // second time assistant sends a message
      .mockResolvedValueOnce({
        data: {
          choices: [
            {
              message: {
                role: "assistant",
                content: "Email not sent",
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
    expect(reply.reply).toBe("Email not sent");
    // check that the email has not been sent
    expect(session.sentEmails.length).toBe(0);
    // message is blocked
    expect(reply.defenceInfo.blocked).toBe(true);
    // EMAIL_WHITELIST defence is triggered
    expect(reply.defenceInfo.triggeredDefences.length).toBe(1);
    expect(reply.defenceInfo.triggeredDefences[0]).toBe("EMAIL_WHITELIST");

    // restore the mock
    mockCreateChatCompletion.mockRestore();
  }
);

test(
  "GIVEN the assistant sends an email AND EMAIL_WHITELIST is active AND email is in the whitelist" +
    "WHEN sending message " +
    "THEN email is sent AND message is not blocked AND EMAIL_WHITELIST defence is not triggered",
  async () => {
    const message = "Send an email to bob@example.com saying hi";
    const session = {
      defences: [
        {
          id: "EMAIL_WHITELIST",
          isActive: true,
          configuration: [{ id: "whitelist", value: "bob@example.com" }],
        },
      ],
      chatHistory: [],
      sentEmails: [],
    };

    // set email whitelist
    process.env.EMAIL_WHITELIST = "bob@example.com";

    // Mock the createChatCompletion function
    mockCreateChatCompletion
      // first time sendEmail is called
      .mockResolvedValueOnce({
        data: {
          choices: [
            {
              message: {
                role: "assistant",
                content: null,
                function_call: {
                  name: "sendEmail",
                  arguments:
                    '{\n  "address": "bob@example.com",\n  "subject": "Hi",\n  "body": "Hello"\n}',
                },
              },
            },
          ],
        },
      })
      // second time assistant sends a message
      .mockResolvedValueOnce({
        data: {
          choices: [
            {
              message: {
                role: "assistant",
                content: "Email sent",
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
    expect(reply.reply).toBe("Email sent");
    // check that the email has been sent
    expect(session.sentEmails.length).toBe(1);
    expect(session.sentEmails[0].address).toBe("bob@example.com");
    expect(session.sentEmails[0].subject).toBe("Hi");
    expect(session.sentEmails[0].content).toBe("Hello");
    // message is not blocked
    expect(reply.defenceInfo.blocked).toBe(false);
    // EMAIL_WHITELIST defence is not triggered
    expect(reply.defenceInfo.triggeredDefences.length).toBe(0);

    // restore the mock
    mockCreateChatCompletion.mockRestore();
  }
);

test(
  "GIVEN the assistant sends an email AND EMAIL_WHITELIST is inactive AND email is in the whitelist" +
    "WHEN sending message " +
    "THEN email is sent AND message is not blocked AND EMAIL_WHITELIST defence is not triggered",
  async () => {
    const message = "Send an email to bob@example.com saying hi";
    const session = {
      defences: [
        {
          id: "EMAIL_WHITELIST",
          isActive: false,
          configuration: [{ id: "whitelist", value: "bob@example.com" }],
        },
      ],
      chatHistory: [],
      sentEmails: [],
    };

    // set email whitelist
    process.env.EMAIL_WHITELIST = "bob@example.com";

    // Mock the createChatCompletion function
    mockCreateChatCompletion
      // first time sendEmail is called
      .mockResolvedValueOnce({
        data: {
          choices: [
            {
              message: {
                role: "assistant",
                content: null,
                function_call: {
                  name: "sendEmail",
                  arguments:
                    '{\n  "address": "bob@example.com",\n  "subject": "Hi",\n  "body": "Hello"\n}',
                },
              },
            },
          ],
        },
      })
      // second time assistant sends a message
      .mockResolvedValueOnce({
        data: {
          choices: [
            {
              message: {
                role: "assistant",
                content: "Email sent",
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
    expect(reply.reply).toBe("Email sent");
    // check that the email has been sent
    expect(session.sentEmails.length).toBe(1);
    expect(session.sentEmails[0].address).toBe("bob@example.com");
    expect(session.sentEmails[0].subject).toBe("Hi");
    expect(session.sentEmails[0].content).toBe("Hello");
    // message is not blocked
    expect(reply.defenceInfo.blocked).toBe(false);
    // EMAIL_WHITELIST defence is not triggered
    expect(reply.defenceInfo.triggeredDefences.length).toBe(0);

    // restore the mock
    mockCreateChatCompletion.mockRestore();
  }
);
