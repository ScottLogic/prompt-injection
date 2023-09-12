import {
  CHAT_MESSAGE_TYPE,
  CHAT_MODELS,
  ChatHistoryMessage,
} from "../../src/models/chat";
import { chatGptSendMessage } from "../../src/openai";
import { DEFENCE_TYPES, DefenceInfo } from "../../src/models/defence";
import { EmailInfo } from "../../src/models/email";
import { activateDefence, getInitialDefences } from "../../src/defence";

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
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const originalModule = jest.requireActual("../../src/langchain");
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
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

test("GIVEN OpenAI initialised WHEN sending message THEN reply is returned", async () => {
  const message = "Hello";
  const chatHistory: ChatHistoryMessage[] = [];
  const defences: DefenceInfo[] = [];
  const sentEmails: EmailInfo[] = [];
  const gptModel = CHAT_MODELS.GPT_4;
  const openAiApiKey = "sk-12345";

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

  // send the message
  const reply = await chatGptSendMessage(
    chatHistory,
    defences,
    gptModel,
    message,
    true,
    openAiApiKey,
    sentEmails
  );

  expect(reply).toBeDefined();
  expect(reply?.completion).toBeDefined();
  expect(reply?.completion.content).toBe("Hi");
  // check the chat history has been updated
  expect(chatHistory.length).toBe(2);
  expect(chatHistory[0].completion?.role).toBe("user");
  expect(chatHistory[0].completion?.content).toBe("Hello");
  expect(chatHistory[1].completion?.role).toBe("assistant");
  expect(chatHistory[1].completion?.content).toBe("Hi");

  // restore the mock
  mockCreateChatCompletion.mockRestore();
});

test("GIVEN SYSTEM_ROLE defence is active WHEN sending message THEN system role is added to chat history", async () => {
  // set the system role prompt
  process.env.SYSTEM_ROLE = "You are a helpful assistant";

  const message = "Hello";
  const chatHistory: ChatHistoryMessage[] = [];
  let defences: DefenceInfo[] = getInitialDefences();
  const sentEmails: EmailInfo[] = [];
  const gptModel = CHAT_MODELS.GPT_4;
  const openAiApiKey = "sk-12345";

  defences = activateDefence(DEFENCE_TYPES.SYSTEM_ROLE, defences);

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

  // send the message
  const reply = await chatGptSendMessage(
    chatHistory,
    defences,
    gptModel,
    message,
    true,
    openAiApiKey,
    sentEmails
  );

  expect(reply).toBeDefined();
  expect(reply?.completion.content).toBe("Hi");
  // check the chat history has been updated
  expect(chatHistory.length).toBe(3);
  // system role is added to the start of the chat history
  expect(chatHistory[0].completion?.role).toBe("system");
  expect(chatHistory[0].completion?.content).toBe(process.env.SYSTEM_ROLE);
  expect(chatHistory[1].completion?.role).toBe("user");
  expect(chatHistory[1].completion?.content).toBe("Hello");
  expect(chatHistory[2].completion?.role).toBe("assistant");
  expect(chatHistory[2].completion?.content).toBe("Hi");

  // restore the mock
  mockCreateChatCompletion.mockRestore();
});

test("GIVEN SYSTEM_ROLE defence is active WHEN sending message THEN system role is added to the start of the chat history", async () => {
  // set the system role prompt
  process.env.SYSTEM_ROLE = "You are a helpful assistant";

  const message = "Hello";
  const isOriginalMessage = true;
  const chatHistory: ChatHistoryMessage[] = [
    {
      completion: {
        role: "user",
        content: "I'm a user",
      },
      chatMessageType: CHAT_MESSAGE_TYPE.USER,
    },
    {
      completion: {
        role: "assistant",
        content: "I'm an assistant",
      },
      chatMessageType: CHAT_MESSAGE_TYPE.BOT,
    },
  ];
  let defences: DefenceInfo[] = getInitialDefences();
  const sentEmails: EmailInfo[] = [];
  const gptModel = CHAT_MODELS.GPT_4;
  const openAiApiKey = "sk-12345";

  // activate the SYSTEM_ROLE defence
  defences = activateDefence(DEFENCE_TYPES.SYSTEM_ROLE, defences);

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

  // send the message
  const reply = await chatGptSendMessage(
    chatHistory,
    defences,
    gptModel,
    message,
    isOriginalMessage,
    openAiApiKey,
    sentEmails
  );

  expect(reply).toBeDefined();
  expect(reply?.completion.content).toBe("Hi");
  // check the chat history has been updated
  expect(chatHistory.length).toBe(5);
  // system role is added to the start of the chat history
  expect(chatHistory[0].completion?.role).toBe("system");
  expect(chatHistory[0].completion?.content).toBe(process.env.SYSTEM_ROLE);
  // rest of the chat history is in order
  expect(chatHistory[1].completion?.role).toBe("user");
  expect(chatHistory[1].completion?.content).toBe("I'm a user");
  expect(chatHistory[2].completion?.role).toBe("assistant");
  expect(chatHistory[2].completion?.content).toBe("I'm an assistant");
  expect(chatHistory[3].completion?.role).toBe("user");
  expect(chatHistory[3].completion?.content).toBe("Hello");
  expect(chatHistory[4].completion?.role).toBe("assistant");
  expect(chatHistory[4].completion?.content).toBe("Hi");

  // restore the mock
  mockCreateChatCompletion.mockRestore();
});

test("GIVEN SYSTEM_ROLE defence is inactive WHEN sending message THEN system role is removed from the chat history", async () => {
  const message = "Hello";
  const chatHistory: ChatHistoryMessage[] = [
    {
      completion: {
        role: "system",
        content: "You are a helpful assistant",
      },
      chatMessageType: CHAT_MESSAGE_TYPE.SYSTEM,
    },
    {
      completion: {
        role: "user",
        content: "I'm a user",
      },
      chatMessageType: CHAT_MESSAGE_TYPE.USER,
    },
    {
      completion: {
        role: "assistant",
        content: "I'm an assistant",
      },
      chatMessageType: CHAT_MESSAGE_TYPE.BOT,
    },
  ];
  const defences: DefenceInfo[] = getInitialDefences();
  const sentEmails: EmailInfo[] = [];
  const gptModel = CHAT_MODELS.GPT_4;
  const openAiApiKey = "sk-12345";

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

  // send the message
  const reply = await chatGptSendMessage(
    chatHistory,
    defences,
    gptModel,
    message,
    true,
    openAiApiKey,
    sentEmails
  );

  expect(reply).toBeDefined();
  expect(reply?.completion.content).toBe("Hi");
  // check the chat history has been updated
  expect(chatHistory.length).toBe(4);
  // system role is removed from the start of the chat history
  // rest of the chat history is in order
  expect(chatHistory[0].completion?.role).toBe("user");
  expect(chatHistory[0].completion?.content).toBe("I'm a user");
  expect(chatHistory[1].completion?.role).toBe("assistant");
  expect(chatHistory[1].completion?.content).toBe("I'm an assistant");
  expect(chatHistory[2].completion?.role).toBe("user");
  expect(chatHistory[2].completion?.content).toBe("Hello");
  expect(chatHistory[3].completion?.role).toBe("assistant");
  expect(chatHistory[3].completion?.content).toBe("Hi");

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
    const chatHistory: ChatHistoryMessage[] = [
      {
        completion: {
          role: "system",
          content: "You are a helpful assistant",
        },
        chatMessageType: CHAT_MESSAGE_TYPE.SYSTEM,
      },
      {
        completion: {
          role: "user",
          content: "I'm a user",
        },
        chatMessageType: CHAT_MESSAGE_TYPE.USER,
      },
      {
        completion: {
          role: "assistant",
          content: "I'm an assistant",
        },
        chatMessageType: CHAT_MESSAGE_TYPE.BOT,
      },
    ];
    let defences: DefenceInfo[] = getInitialDefences();
    const sentEmails: EmailInfo[] = [];
    const gptModel = CHAT_MODELS.GPT_4;
    const openAiApiKey = "sk-12345";

    defences = activateDefence(DEFENCE_TYPES.SYSTEM_ROLE, defences);

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

    // send the message
    const reply = await chatGptSendMessage(
      chatHistory,
      defences,
      gptModel,
      message,
      true,
      openAiApiKey,
      sentEmails
    );

    expect(reply).toBeDefined();
    expect(reply?.completion.content).toBe("Hi");
    // check the chat history has been updated
    expect(chatHistory.length).toBe(5);
    // system role is added to the start of the chat history
    expect(chatHistory[0].completion?.role).toBe("system");
    expect(chatHistory[0].completion?.content).toBe(process.env.SYSTEM_ROLE);
    // rest of the chat history is in order
    expect(chatHistory[1].completion?.role).toBe("user");
    expect(chatHistory[1].completion?.content).toBe("I'm a user");
    expect(chatHistory[2].completion?.role).toBe("assistant");
    expect(chatHistory[2].completion?.content).toBe("I'm an assistant");
    expect(chatHistory[3].completion?.role).toBe("user");
    expect(chatHistory[3].completion?.content).toBe("Hello");
    expect(chatHistory[4].completion?.role).toBe("assistant");
    expect(chatHistory[4].completion?.content).toBe("Hi");

    // restore the mock
    mockCreateChatCompletion.mockRestore();
  }
);

test(
  "GIVEN the assistant sends an email AND EMAIL_WHITELIST is inactive AND email is not in the whitelist" +
    "WHEN sending message " +
    "THEN email is sent AND message is not blocked AND EMAIL_WHITELIST defence is alerted",
  async () => {
    // set email whitelist
    process.env.EMAIL_WHITELIST = "";

    const message = "Hello";
    const chatHistory: ChatHistoryMessage[] = [];
    const defences: DefenceInfo[] = getInitialDefences();
    const sentEmails: EmailInfo[] = [];
    const gptModel = CHAT_MODELS.GPT_4;
    const openAiApiKey = "sk-12345";

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
                    '{\n  "address": "bob@example.com",\n  "subject": "Hi",\n  "body": "Hello", "confirmed": "true" \n}',
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

    // send the message
    const reply = await chatGptSendMessage(
      chatHistory,
      defences,
      gptModel,
      message,
      true,
      openAiApiKey,
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
    // EMAIL_WHITELIST defence is alerted
    expect(reply?.defenceInfo.alertedDefences.length).toBe(1);
    expect(reply?.defenceInfo.alertedDefences[0]).toBe(
      DEFENCE_TYPES.EMAIL_WHITELIST
    );

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
    const chatHistory: ChatHistoryMessage[] = [];
    let defences: DefenceInfo[] = getInitialDefences();
    const sentEmails: EmailInfo[] = [];
    const gptModel = CHAT_MODELS.GPT_4;
    const openAiApiKey = "sk-12345";
    const isOriginalMessage = true;

    defences = activateDefence(DEFENCE_TYPES.EMAIL_WHITELIST, defences);

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
                    '{\n  "address": "bob@example.com",\n  "subject": "Hi",\n  "body": "Hello", "confirmed": "true" \n}',
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

    // send the message
    const reply = await chatGptSendMessage(
      chatHistory,
      defences,
      gptModel,
      message,
      isOriginalMessage,
      openAiApiKey,
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
    expect(reply?.defenceInfo.triggeredDefences[0]).toBe(
      DEFENCE_TYPES.EMAIL_WHITELIST
    );

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
    const chatHistory: ChatHistoryMessage[] = [];
    let defences: DefenceInfo[] = getInitialDefences();
    const sentEmails: EmailInfo[] = [];
    const gptModel = CHAT_MODELS.GPT_4;
    const openAiApiKey = "sk-12345";
    const isOriginalMessage = true;

    defences = activateDefence(DEFENCE_TYPES.EMAIL_WHITELIST, defences);

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
                    '{\n  "address": "bob@example.com",\n  "subject": "Hi",\n  "body": "Hello", "confirmed": "true" \n}',
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

    // send the message
    const reply = await chatGptSendMessage(
      chatHistory,
      defences,
      gptModel,
      message,
      isOriginalMessage,
      openAiApiKey,
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
    const chatHistory: ChatHistoryMessage[] = [];
    const defences: DefenceInfo[] = getInitialDefences();
    const sentEmails: EmailInfo[] = [];
    const gptModel = CHAT_MODELS.GPT_4;
    const openAiApiKey = "sk-12345";
    const isOriginalMessage = true;

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
                    '{\n  "address": "bob@example.com",\n  "subject": "Hi",\n  "body": "Hello", "confirmed": "true" \n}',
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

    // send the message
    const reply = await chatGptSendMessage(
      chatHistory,
      defences,
      gptModel,
      message,
      isOriginalMessage,
      openAiApiKey,
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
test("GIVEN the output filtering defence is active WHEN the bot responds with a message containing a phrase in the list THEN the defence is triggered and the message is blocked", async () => {
  process.env.FILTER_LIST_OUTPUT = "secret project,password";
  const message = "What is the secret Project?";

  const chatHistory: ChatHistoryMessage[] = [];
  let defences: DefenceInfo[] = getInitialDefences();
  const sentEmails: EmailInfo[] = [];
  const gptModel = CHAT_MODELS.GPT_4;
  const openAiApiKey = "sk-12345";
  const isOriginalMessage = true;

  defences = activateDefence(DEFENCE_TYPES.FILTER_BOT_OUTPUT, defences);

  mockCreateChatCompletion.mockResolvedValueOnce({
    data: {
      choices: [
        {
          message: {
            role: "assistant",
            content: "The secret project is Project X!",
          },
        },
      ],
    },
  });
  const reply = await chatGptSendMessage(
    chatHistory,
    defences,
    gptModel,
    message,
    isOriginalMessage,
    openAiApiKey,
    sentEmails
  );

  expect(reply).toBeDefined();
  expect(reply?.defenceInfo.isBlocked).toBe(true);
  expect(reply?.defenceInfo.triggeredDefences.length).toBe(1);
  expect(reply?.defenceInfo.blockedReason).toBe(
    "My original response was blocked as it contained a restricted word/phrase. Ask me something else. "
  );

  mockCreateChatCompletion.mockRestore();
});

test("GIVEN the output filtering defence is active WHEN the bot responds with a message containing a phrase not in the list THEN the message is not blocked", async () => {
  process.env.FILTER_LIST_OUTPUT = "secret project,password";
  const message = "What is the secret Project?";

  const chatHistory: ChatHistoryMessage[] = [];
  let defences: DefenceInfo[] = getInitialDefences();
  const sentEmails: EmailInfo[] = [];
  const gptModel = CHAT_MODELS.GPT_4;
  const openAiApiKey = "sk-12345";
  const isOriginalMessage = true;

  defences = activateDefence(DEFENCE_TYPES.FILTER_BOT_OUTPUT, defences);

  mockCreateChatCompletion.mockResolvedValueOnce({
    data: {
      choices: [
        {
          message: {
            role: "assistant",
            content: "I cant tell you!",
          },
        },
      ],
    },
  });
  const reply = await chatGptSendMessage(
    chatHistory,
    defences,
    gptModel,
    message,
    isOriginalMessage,
    openAiApiKey,
    sentEmails
  );

  expect(reply).toBeDefined();
  expect(reply?.completion.content).toBe("I cant tell you!");
  expect(reply?.defenceInfo.isBlocked).toBe(false);
  expect(reply?.defenceInfo.triggeredDefences.length).toBe(0);

  mockCreateChatCompletion.mockRestore();
});

test(
  "GIVEN the output filtering defence is not active " +
    "WHEN the bot responds with a message containing a phrase in the list " +
    "THEN the defence is triggered AND the message is not blocked",
  async () => {
    process.env.FILTER_LIST_OUTPUT = "secret project,password";
    const message = "What is the secret Project?";

    const chatHistory: ChatHistoryMessage[] = [];
    const defences: DefenceInfo[] = getInitialDefences();
    const sentEmails: EmailInfo[] = [];
    const gptModel = CHAT_MODELS.GPT_4;
    const openAiApiKey = "sk-12345";
    const isOriginalMessage = true;

    mockCreateChatCompletion.mockResolvedValueOnce({
      data: {
        choices: [
          {
            message: {
              role: "assistant",
              content: "The secret project is X.",
            },
          },
        ],
      },
    });
    const reply = await chatGptSendMessage(
      chatHistory,
      defences,
      gptModel,
      message,
      isOriginalMessage,
      openAiApiKey,
      sentEmails
    );

    expect(reply).toBeDefined();
    expect(reply?.completion.content).toBe("The secret project is X.");
    expect(reply?.defenceInfo.isBlocked).toBe(false);
    expect(reply?.defenceInfo.alertedDefences.length).toBe(1);
    expect(reply?.defenceInfo.alertedDefences[0]).toBe(
      DEFENCE_TYPES.FILTER_BOT_OUTPUT
    );

    mockCreateChatCompletion.mockRestore();
  }
);
