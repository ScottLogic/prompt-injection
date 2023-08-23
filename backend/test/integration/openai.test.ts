import { ChatCompletionRequestMessage } from "openai";
import { activateDefence, getInitialDefences } from "../../src/defence";
import { CHAT_MODELS } from "../../src/models/chat";
import { initOpenAi, chatGptSendMessage } from "../../src/openai";
import { DefenceInfo } from "../../src/models/defence";
import { EmailInfo } from "../../src/models/email";

// Define a mock implementation for the createChatCompletion method
const mockCreateChatCompletion = jest.fn();
// Mock the OpenAIApi class
jest.mock("openai", () => ({
  OpenAIApi: jest.fn().mockImplementation(() => ({
    createChatCompletion: mockCreateChatCompletion,
  })),
  Configuration: jest.fn().mockImplementation(() => ({})),
}));

// mock the queryPromptEvaluationModel function
jest.mock("../../src/langchain", () => {
  const originalModule = jest.requireActual("../../src/langchain");
  return {
    ...originalModule,
    queryPromptEvaluationModel: () => {
      return {
        isMalicious: false,
        reason: "",
      };
    },
  };
});

beforeEach(() => {
  // clear environment variables
  process.env = {};
});

test("GIVEN OpenAI not initialised WHEN sending message THEN error is thrown", async () => {
  const message = "Hello";
  const chatHistory: ChatCompletionRequestMessage[] = [];
  const defences: DefenceInfo[] = [];
  const sentEmails: EmailInfo[] = [];
  const gptModel = CHAT_MODELS.GPT_4;

  const reply = await chatGptSendMessage(
    chatHistory,
    defences,
    gptModel,
    message,
    sentEmails
  );

  expect(reply).toBeNull();
});

test("GIVEN OpenAI initialised WHEN sending message THEN reply is returned", async () => {
  const message = "Hello";
  const chatHistory: ChatCompletionRequestMessage[] = [];
  const defences: DefenceInfo[] = [];
  const sentEmails: EmailInfo[] = [];
  const gptModel = CHAT_MODELS.GPT_4;
  const apiKey = "sk-12345";

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
  initOpenAi(apiKey);
  // send the message
  const reply = await chatGptSendMessage(
    chatHistory,
    defences,
    gptModel,
    message,
    sentEmails
  );

  expect(reply).toBeDefined();
  expect(reply?.completion).toBeDefined();
  expect(reply?.completion.content).toBe("Hi");
  // check the chat history has been updated
  expect(chatHistory.length).toBe(2);
  expect(chatHistory[0].role).toBe("user");
  expect(chatHistory[0].content).toBe("Hello");
  expect(chatHistory[1].role).toBe("assistant");
  expect(chatHistory[1].content).toBe("Hi");

  // restore the mock
  mockCreateChatCompletion.mockRestore();
});

test("GIVEN SYSTEM_ROLE defence is active WHEN sending message THEN system role is added to chat history", async () => {
  // set the system role prompt
  process.env.SYSTEM_ROLE = "You are a helpful assistant";

  const message = "Hello";
  const chatHistory: ChatCompletionRequestMessage[] = [];
  let defences: DefenceInfo[] = getInitialDefences();
  const sentEmails: EmailInfo[] = [];
  const gptModel = CHAT_MODELS.GPT_4;
  const apiKey = "sk-12345";

  defences = activateDefence("SYSTEM_ROLE", defences);

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
  initOpenAi(apiKey);
  // send the message
  const reply = await chatGptSendMessage(
    chatHistory,
    defences,
    gptModel,
    message,
    sentEmails
  );

  expect(reply).toBeDefined();
  expect(reply?.completion.content).toBe("Hi");
  // check the chat history has been updated
  expect(chatHistory.length).toBe(3);
  // system role is added to the start of the chat history
  expect(chatHistory[0].role).toBe("system");
  expect(chatHistory[0].content).toBe(process.env.SYSTEM_ROLE);
  expect(chatHistory[1].role).toBe("user");
  expect(chatHistory[1].content).toBe("Hello");
  expect(chatHistory[2].role).toBe("assistant");
  expect(chatHistory[2].content).toBe("Hi");

  // restore the mock
  mockCreateChatCompletion.mockRestore();
});

test("GIVEN SYSTEM_ROLE defence is active WHEN sending message THEN system role is added to the start of the chat history", async () => {
  // set the system role prompt
  process.env.SYSTEM_ROLE = "You are a helpful assistant";

  const message = "Hello";
  const chatHistory: ChatCompletionRequestMessage[] = [
    {
      role: "user",
      content: "I'm a user",
    },
    {
      role: "assistant",
      content: "I'm an assistant",
    },
  ];
  let defences: DefenceInfo[] = getInitialDefences();
  const sentEmails: EmailInfo[] = [];
  const gptModel = CHAT_MODELS.GPT_4;
  const apiKey = "sk-12345";

  // activate the SYSTEM_ROLE defence
  defences = activateDefence("SYSTEM_ROLE", defences);

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
  initOpenAi(apiKey);
  // send the message
  const reply = await chatGptSendMessage(
    chatHistory,
    defences,
    gptModel,
    message,
    sentEmails
  );

  expect(reply).toBeDefined();
  expect(reply?.completion.content).toBe("Hi");
  // check the chat history has been updated
  expect(chatHistory.length).toBe(5);
  // system role is added to the start of the chat history
  expect(chatHistory[0].role).toBe("system");
  expect(chatHistory[0].content).toBe(process.env.SYSTEM_ROLE);
  // rest of the chat history is in order
  expect(chatHistory[1].role).toBe("user");
  expect(chatHistory[1].content).toBe("I'm a user");
  expect(chatHistory[2].role).toBe("assistant");
  expect(chatHistory[2].content).toBe("I'm an assistant");
  expect(chatHistory[3].role).toBe("user");
  expect(chatHistory[3].content).toBe("Hello");
  expect(chatHistory[4].role).toBe("assistant");
  expect(chatHistory[4].content).toBe("Hi");

  // restore the mock
  mockCreateChatCompletion.mockRestore();
});

test("GIVEN SYSTEM_ROLE defence is inactive WHEN sending message THEN system role is removed from the chat history", async () => {
  const message = "Hello";
  const chatHistory: ChatCompletionRequestMessage[] = [
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
  ];
  let defences: DefenceInfo[] = getInitialDefences();
  const sentEmails: EmailInfo[] = [];
  const gptModel = CHAT_MODELS.GPT_4;
  const apiKey = "sk-12345";

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
  initOpenAi(apiKey);
  // send the message
  const reply = await chatGptSendMessage(
    chatHistory,
    defences,
    gptModel,
    message,
    sentEmails
  );

  expect(reply).toBeDefined();
  expect(reply?.completion.content).toBe("Hi");
  // check the chat history has been updated
  expect(chatHistory.length).toBe(4);
  // system role is removed from the start of the chat history
  // rest of the chat history is in order
  expect(chatHistory[0].role).toBe("user");
  expect(chatHistory[0].content).toBe("I'm a user");
  expect(chatHistory[1].role).toBe("assistant");
  expect(chatHistory[1].content).toBe("I'm an assistant");
  expect(chatHistory[2].role).toBe("user");
  expect(chatHistory[2].content).toBe("Hello");
  expect(chatHistory[3].role).toBe("assistant");
  expect(chatHistory[3].content).toBe("Hi");

  // restore the mock
  mockCreateChatCompletion.mockRestore();
});

test(
  "GIVEN SYSTEM_ROLE defence is active AND the system role is already in the chat history " +
    "WHEN sending message THEN system role is not re-added to the chat history",
  async () => {
    // set the system role prompt
    process.env.SYSTEM_ROLE = "You are a helpful assistant";
    
    const message = "Hello";
    const chatHistory: ChatCompletionRequestMessage[] = [
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
    ];
    let defences: DefenceInfo[] = getInitialDefences();
    const sentEmails: EmailInfo[] = [];
    const gptModel = CHAT_MODELS.GPT_4;
    const apiKey = "sk-12345";

    defences = activateDefence("SYSTEM_ROLE", defences);

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
    initOpenAi(apiKey);
    // send the message
    const reply = await chatGptSendMessage(
      chatHistory,
      defences,
      gptModel,
      message,
      sentEmails
    );

    expect(reply).toBeDefined();
    expect(reply?.completion.content).toBe("Hi");
    // check the chat history has been updated
    expect(chatHistory.length).toBe(5);
    // system role is added to the start of the chat history
    expect(chatHistory[0].role).toBe("system");
    expect(chatHistory[0].content).toBe(process.env.SYSTEM_ROLE);
    // rest of the chat history is in order
    expect(chatHistory[1].role).toBe("user");
    expect(chatHistory[1].content).toBe("I'm a user");
    expect(chatHistory[2].role).toBe("assistant");
    expect(chatHistory[2].content).toBe("I'm an assistant");
    expect(chatHistory[3].role).toBe("user");
    expect(chatHistory[3].content).toBe("Hello");
    expect(chatHistory[4].role).toBe("assistant");
    expect(chatHistory[4].content).toBe("Hi");

    // restore the mock
    mockCreateChatCompletion.mockRestore();
  }
);

test(
  "GIVEN the assistant sends an email AND EMAIL_WHITELIST is inactive AND email is not in the whitelist" +
    "WHEN sending message " +
    "THEN email is sent AND message is not blocked AND EMAIL_WHITELIST defence is triggered",
  async () => {
    // set email whitelist
    process.env.EMAIL_WHITELIST = "";

    const message = "Hello";
    const chatHistory: ChatCompletionRequestMessage[] = [];
    const defences: DefenceInfo[] = getInitialDefences();
    const sentEmails: EmailInfo[] = [];
    const gptModel = CHAT_MODELS.GPT_4;
    const apiKey = "sk-12345";

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
    initOpenAi(apiKey);
    // send the message
    const reply = await chatGptSendMessage(
      chatHistory,
      defences,
      gptModel,
      message,
      sentEmails
    );

    expect(reply).toBeDefined();
    expect(reply?.completion.content).toBe("Email sent");
    // check that the email has been sent
    expect(sentEmails.length).toBe(1);
    expect(sentEmails[0].address).toBe("bob@example.com");
    expect(sentEmails[0].subject).toBe("Hi");
    expect(sentEmails[0].content).toBe("Hello");
    // message is not blocked
    expect(reply?.defenceInfo.isBlocked).toBe(false);
    // EMAIL_WHITELIST defence is triggered
    expect(reply?.defenceInfo.triggeredDefences.length).toBe(1);
    expect(reply?.defenceInfo.triggeredDefences[0]).toBe("EMAIL_WHITELIST");

    // restore the mock
    mockCreateChatCompletion.mockRestore();
  }
);

test(
  "GIVEN the assistant sends an email AND EMAIL_WHITELIST is active AND email is not in the whitelist" +
    "WHEN sending message " +
    "THEN email is not sent AND message is blocked AND EMAIL_WHITELIST defence is triggered",
  async () => {
    // set email whitelist
    process.env.EMAIL_WHITELIST = "";

    const message = "Hello";
    const chatHistory: ChatCompletionRequestMessage[] = [];
    let defences: DefenceInfo[] = getInitialDefences();
    const sentEmails: EmailInfo[] = [];
    const gptModel = CHAT_MODELS.GPT_4;
    const apiKey = "sk-12345";

    defences = activateDefence("EMAIL_WHITELIST", defences);

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
    initOpenAi(apiKey);
    // send the message
    const reply = await chatGptSendMessage(
      chatHistory,
      defences,
      gptModel,
      message,
      sentEmails
    );

    expect(reply).toBeDefined();
    expect(reply?.completion.content).toBe("Email not sent");
    // check that the email has not been sent
    expect(sentEmails.length).toBe(0);
    // message is blocked
    expect(reply?.defenceInfo.isBlocked).toBe(true);
    // EMAIL_WHITELIST defence is triggered
    expect(reply?.defenceInfo.triggeredDefences.length).toBe(1);
    expect(reply?.defenceInfo.triggeredDefences[0]).toBe("EMAIL_WHITELIST");

    // restore the mock
    mockCreateChatCompletion.mockRestore();
  }
);

test(
  "GIVEN the assistant sends an email AND EMAIL_WHITELIST is active AND email is in the whitelist" +
    "WHEN sending message " +
    "THEN email is sent AND message is not blocked AND EMAIL_WHITELIST defence is not triggered",
  async () => {
    // set email whitelist
    process.env.EMAIL_WHITELIST = "bob@example.com";

    const message = "Send an email to bob@example.com saying hi";
    const chatHistory: ChatCompletionRequestMessage[] = [];
    let defences: DefenceInfo[] = getInitialDefences();
    const sentEmails: EmailInfo[] = [];
    const gptModel = CHAT_MODELS.GPT_4;
    const apiKey = "sk-12345";

    defences = activateDefence("EMAIL_WHITELIST", defences);

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
    initOpenAi(apiKey);
    // send the message
    const reply = await chatGptSendMessage(
      chatHistory,
      defences,
      gptModel,
      message,
      sentEmails
    );

    expect(reply).toBeDefined();
    expect(reply?.completion.content).toBe("Email sent");
    // check that the email has been sent
    expect(sentEmails.length).toBe(1);
    expect(sentEmails[0].address).toBe("bob@example.com");
    expect(sentEmails[0].subject).toBe("Hi");
    expect(sentEmails[0].content).toBe("Hello");
    // message is not blocked
    expect(reply?.defenceInfo.isBlocked).toBe(false);
    // EMAIL_WHITELIST defence is not triggered
    expect(reply?.defenceInfo.triggeredDefences.length).toBe(0);

    // restore the mock
    mockCreateChatCompletion.mockRestore();
  }
);

test(
  "GIVEN the assistant sends an email AND EMAIL_WHITELIST is inactive AND email is in the whitelist" +
    "WHEN sending message " +
    "THEN email is sent AND message is not blocked AND EMAIL_WHITELIST defence is not triggered",
  async () => {
    // set email whitelist
    process.env.EMAIL_WHITELIST = "bob@example.com";

    const message = "Send an email to bob@example.com saying hi";
    const chatHistory: ChatCompletionRequestMessage[] = [];
    const defences: DefenceInfo[] = getInitialDefences();
    const sentEmails: EmailInfo[] = [];
    const gptModel = CHAT_MODELS.GPT_4;
    const apiKey = "sk-12345";

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
    initOpenAi(apiKey);
    // send the message
    const reply = await chatGptSendMessage(
      chatHistory,
      defences,
      gptModel,
      message,
      sentEmails
    );

    expect(reply).toBeDefined();
    expect(reply?.completion.content).toBe("Email sent");
    // check that the email has been sent
    expect(sentEmails.length).toBe(1);
    expect(sentEmails[0].address).toBe("bob@example.com");
    expect(sentEmails[0].subject).toBe("Hi");
    expect(sentEmails[0].content).toBe("Hello");
    // message is not blocked
    expect(reply?.defenceInfo.isBlocked).toBe(false);
    // EMAIL_WHITELIST defence is not triggered
    expect(reply?.defenceInfo.triggeredDefences.length).toBe(0);

    // restore the mock
    mockCreateChatCompletion.mockRestore();
  }
);
