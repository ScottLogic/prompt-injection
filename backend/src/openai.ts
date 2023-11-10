import {
  isDefenceActive,
  getSystemRole,
  detectFilterList,
  getFilterList,
  getQAPrePromptFromConfig,
} from "./defence";
import { sendEmail } from "./email";
import { queryDocuments } from "./langchain";
import { EmailInfo, EmailResponse } from "./models/email";
import {
  ChatCompletionRequestMessage,
  ChatCompletionRequestMessageFunctionCall,
  Configuration,
  OpenAIApi,
} from "openai";
import {
  CHAT_MESSAGE_TYPE,
  CHAT_MODELS,
  ChatDefenceReport,
  ChatHistoryMessage,
  ChatModel,
  ChatResponse,
} from "./models/chat";
import { DEFENCE_TYPES, DefenceInfo } from "./models/defence";
import { LEVEL_NAMES } from "./models/level";
import {
  FunctionAskQuestionParams,
  FunctionSendEmailParams,
} from "./models/openai";
import { promptTokensEstimate } from "openai-chat-tokens";

// functions available to ChatGPT
const chatGptFunctions = [
  {
    name: "sendEmail",
    description: "Send an email to someone",
    parameters: {
      type: "object",
      properties: {
        address: {
          type: "string",
          description: "The email address to send the email to",
        },
        subject: {
          type: "string",
          description: "The subject of the email",
        },
        body: {
          type: "string",
          description: "The body of the email",
        },
        confirmed: {
          type: "boolean",
          default: "false",
          description:
            "whether the user has confirmed the email is correct before sending",
        },
      },
      required: ["address", "subject", "body", "confirmed"],
    },
  },
  {
    name: "askQuestion",
    description: "Ask a question about information in the documents",
    parameters: {
      type: "object",
      properties: {
        question: {
          type: "string",
          description: "The question asked about the documents",
        },
      },
    },
  },
];

// max tokens each model can use
const chatModelMaxTokens = {
  [CHAT_MODELS.GPT_4]: 8191,
  [CHAT_MODELS.GPT_4_0613]: 8191,
  [CHAT_MODELS.GPT_3_5_TURBO]: 4095,
  [CHAT_MODELS.GPT_3_5_TURBO_0613]: 4095,
  [CHAT_MODELS.GPT_3_5_TURBO_16K]: 16384,
  [CHAT_MODELS.GPT_3_5_TURBO_16K_0613]: 16384,
};

const getOpenAIKey = (() => {
  let openAIKey: string | undefined = undefined;
  return () => {
    if (!openAIKey) {
      openAIKey = process.env.OPENAI_API_KEY;
      if (!openAIKey) {
        throw new Error(
          "OpenAI API key not found in environment vars - cannot continue!"
        );
      }
    }
    return openAIKey;
  };
})();

/**
 * Checks the given model is supported by the OpenAI API key
 * @throws Error if the key cannot be used with the model
 */
async function verifyKeySupportsModel(gptModel: string) {
  const apiKey = getOpenAIKey();
  const testOpenAI: OpenAIApi = new OpenAIApi(new Configuration({ apiKey }));
  await testOpenAI.createChatCompletion({
    model: gptModel,
    messages: [{ role: "user", content: "this is a test prompt" }],
  });
}

function getOpenAIApi() {
  const apiKey = getOpenAIKey();
  return new OpenAIApi(new Configuration({ apiKey }));
}

function isChatGptFunction(functionName: string) {
  return chatGptFunctions.some((func) => func.name === functionName);
}

async function chatGptCallFunction(
  defenceInfo: ChatDefenceReport,
  defences: DefenceInfo[],
  functionCall: ChatCompletionRequestMessageFunctionCall,
  sentEmails: EmailInfo[],
  // default to sandbox
  currentLevel: LEVEL_NAMES = LEVEL_NAMES.SANDBOX
) {
  let reply: ChatCompletionRequestMessage | null = null;
  let wonLevel = false;
  // get the function name
  const functionName: string = functionCall.name ?? "";

  // check if we know the function
  if (isChatGptFunction(functionName)) {
    console.debug(`Function call: ${functionName}`);
    let response = "";
    // call the function
    if (functionName === "sendEmail") {
      if (functionCall.arguments) {
        const params = JSON.parse(
          functionCall.arguments
        ) as FunctionSendEmailParams;
        console.debug("Send email params: ", JSON.stringify(params));
        const emailResponse: EmailResponse = sendEmail(
          params.address,
          params.subject,
          params.body,
          params.confirmed,
          currentLevel
        );
        response = emailResponse.response;
        wonLevel = emailResponse.wonLevel;
        if (emailResponse.sentEmail) {
          sentEmails.push(emailResponse.sentEmail);
        }
      }
    }
    if (functionName === "askQuestion") {
      if (functionCall.arguments) {
        const params = JSON.parse(
          functionCall.arguments
        ) as FunctionAskQuestionParams;
        console.debug(`Asking question: ${params.question}`);
        // if asking a question, call the queryDocuments
        let configQAPrePrompt = "";
        if (isDefenceActive(DEFENCE_TYPES.QA_LLM_INSTRUCTIONS, defences)) {
          configQAPrePrompt = getQAPrePromptFromConfig(defences);
        }
        response = (
          await queryDocuments(params.question, configQAPrePrompt, currentLevel)
        ).reply;
      } else {
        console.error("No arguments provided to askQuestion function");
      }
    }

    reply = {
      role: "function",
      content: response,
      name: functionName,
    };
  } else {
    console.error(`Unknown function: ${functionName}`);
  }

  if (reply) {
    return {
      completion: reply,
      defenceInfo,
      wonLevel,
    };
  } else {
    return null;
  }
}

async function chatGptChatCompletion(
  chatHistory: ChatHistoryMessage[],
  defences: DefenceInfo[],
  chatModel: ChatModel,
  openai: OpenAIApi,
  // default to sandbox
  currentLevel: LEVEL_NAMES = LEVEL_NAMES.SANDBOX
) {
  // check if we need to set a system role
  // system role is always active on levels
  if (
    currentLevel !== LEVEL_NAMES.SANDBOX ||
    isDefenceActive(DEFENCE_TYPES.SYSTEM_ROLE, defences)
  ) {
    const completionConfig: ChatCompletionRequestMessage = {
      role: "system",
      content: getSystemRole(defences, currentLevel),
    };

    // check to see if there's already a system role
    const systemRole = chatHistory.find(
      (message) => message.completion?.role === "system"
    );
    if (!systemRole) {
      // add the system role to the start of the chat history
      chatHistory.unshift({
        completion: completionConfig,
        chatMessageType: CHAT_MESSAGE_TYPE.SYSTEM,
      });
    } else {
      // replace with the latest system role
      systemRole.completion = completionConfig;
    }
  } else {
    // remove the system role from the chat history
    while (
      chatHistory.length > 0 &&
      chatHistory[0].completion?.role === "system"
    ) {
      chatHistory.shift();
    }
  }
  console.debug("Talking to model: ", JSON.stringify(chatModel));

  // get start time
  const startTime = new Date().getTime();
  console.debug("Calling OpenAI chat completion...");

  try {
    const chat_completion = await openai.createChatCompletion({
      model: chatModel.id,
      temperature: chatModel.configuration.temperature,
      top_p: chatModel.configuration.topP,
      frequency_penalty: chatModel.configuration.frequencyPenalty,
      presence_penalty: chatModel.configuration.presencePenalty,
      messages: getChatCompletionsFromHistory(chatHistory, chatModel.id),
      functions: chatGptFunctions,
    });
    return chat_completion.data.choices[0].message ?? null;
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error calling createChatCompletion: ", error.message);
    }
    return null;
  } finally {
    const endTime = new Date().getTime();
    console.debug(`OpenAI chat completion took ${endTime - startTime}ms`);
  }
}

// estimate the tokens on a single completion
function estimateMessageTokens(
  message: ChatCompletionRequestMessage | null | undefined
) {
  if (message) {
    const estTokens = promptTokensEstimate({ messages: [message] });
    console.debug("message:", message, "tokens:", estTokens);
    return estTokens;
  }
  return 0;
}

// take only the chat history to send to GPT that is within the max tokens
function filterChatHistoryByMaxTokens(
  chatHistory: ChatCompletionRequestMessage[],
  maxNumTokens: number
): ChatCompletionRequestMessage[] {
  // estimate total prompt tokens including chat history and function call definitions
  const estimatedTokens =
    promptTokensEstimate({
      messages: chatHistory,
      functions: chatGptFunctions,
    }) + 5; // there is an offset of 5 between openai completion prompt_tokens

  // if the estimated tokens is less than the max tokens, no need to filter
  if (estimatedTokens <= maxNumTokens) {
    return chatHistory;
  }

  console.log(
    "Filtering chat history to fit inside context window. estimated_tokens = ",
    estimatedTokens
  );
  let sumTokens = 0;
  const filteredList: ChatCompletionRequestMessage[] = [];

  // reverse list to add from most recent
  const reverseList = chatHistory.slice().reverse();

  // always add the most recent message to start of list
  filteredList.push(reverseList[0]);
  sumTokens += estimateMessageTokens(reverseList[0]);

  // if the first message is a system role add it to list
  if (chatHistory[0].role === "system") {
    sumTokens += estimateMessageTokens(chatHistory[0]);
    filteredList.push(chatHistory[0]);
  }

  // add elements after first message until max tokens reached
  for (let i = 1; i < reverseList.length; i++) {
    const element = reverseList[i];
    const numTokens = estimateMessageTokens(element);
    // if we reach end and system role is there skip as it's already been added
    if (element.role === "system") {
      continue;
    }
    if (sumTokens + numTokens <= maxNumTokens) {
      filteredList.splice(i, 0, element);
      sumTokens += numTokens;
    } else {
      console.debug("Max tokens reached on completion = ", element);
      break;
    }
  }
  return filteredList.reverse();
}

// take only the completions to send to GPT
function getChatCompletionsFromHistory(
  chatHistory: ChatHistoryMessage[],
  gptModel: CHAT_MODELS
): ChatCompletionRequestMessage[] {
  // take only completions to send to model
  const completions: ChatCompletionRequestMessage[] =
    chatHistory.length > 0
      ? (chatHistory
          .filter((message) => message.completion !== null)
          .map(
            (message) => message.completion
          ) as ChatCompletionRequestMessage[])
      : [];

  // limit the number of tokens sent to GPT to fit inside context window
  const maxTokens = chatModelMaxTokens[gptModel];
  const reducedCompletions = filterChatHistoryByMaxTokens(
    completions,
    maxTokens
  );

  const diff = completions.length - reducedCompletions.length;
  if (diff > 0) {
    console.log(
      "Trimmed completions to fit inside context window. messages trimmed=",
      diff
    );
  }
  return completions;
}

function pushCompletionToHistory(
  chatHistory: ChatHistoryMessage[],
  completion: ChatCompletionRequestMessage,
  chatMessageType: CHAT_MESSAGE_TYPE
) {
  // limit the length of the chat history
  const maxChatHistoryLength = 1000;

  if (chatMessageType !== CHAT_MESSAGE_TYPE.BOT_BLOCKED) {
    // remove the oldest message, not including system role message
    if (chatHistory.length >= maxChatHistoryLength) {
      if (chatHistory[0].completion?.role !== "system") {
        chatHistory.shift();
      } else {
        chatHistory.splice(1, 1);
      }
    }
    chatHistory.push({
      completion,
      chatMessageType,
    });
  } else {
    // do not add the bots reply which was subsequently blocked
    console.log("Skipping adding blocked message to chat history", completion);
  }
  return chatHistory;
}

async function chatGptSendMessage(
  chatHistory: ChatHistoryMessage[],
  defences: DefenceInfo[],
  chatModel: ChatModel,
  message: string,
  messageIsTransformed: boolean,
  sentEmails: EmailInfo[],
  // default to sandbox
  currentLevel: LEVEL_NAMES = LEVEL_NAMES.SANDBOX
) {
  console.log(`User message: '${message}'`);

  // init defence info
  const defenceInfo: ChatDefenceReport = {
    blockedReason: "",
    isBlocked: false,
    alertedDefences: [],
    triggeredDefences: [],
  };

  const chatResponse: ChatResponse = {
    completion: null,
    defenceInfo,
    wonLevel: false,
  };

  // add user message to chat
  chatHistory = pushCompletionToHistory(
    chatHistory,
    {
      role: "user",
      content: message,
    },
    messageIsTransformed
      ? CHAT_MESSAGE_TYPE.USER_TRANSFORMED
      : CHAT_MESSAGE_TYPE.USER
  );

  const openai = getOpenAIApi();
  let reply = await chatGptChatCompletion(
    chatHistory,
    defences,
    chatModel,
    openai,
    currentLevel
  );
  // check if GPT wanted to call a function
  while (reply?.function_call) {
    chatHistory = pushCompletionToHistory(
      chatHistory,
      reply,
      CHAT_MESSAGE_TYPE.FUNCTION_CALL
    );

    // call the function and get a new reply and defence info from
    const functionCallReply = await chatGptCallFunction(
      defenceInfo,
      defences,
      reply.function_call,
      sentEmails,
      currentLevel
    );
    if (functionCallReply) {
      chatResponse.wonLevel = functionCallReply.wonLevel;

      // add the function call to the chat history
      chatHistory = pushCompletionToHistory(
        chatHistory,
        functionCallReply.completion,
        CHAT_MESSAGE_TYPE.FUNCTION_CALL
      );
      // update the defence info
      chatResponse.defenceInfo = functionCallReply.defenceInfo;
    }
    // get a new reply from ChatGPT now that the function has been called
    reply = await chatGptChatCompletion(
      chatHistory,
      defences,
      chatModel,
      openai,
      currentLevel
    );
  }
  if (!reply?.content) {
    // failed to get reply from GPT
    return chatResponse;
  } else {
    chatResponse.completion = reply;

    // if output filter defence is active, check for blocked words/phrases
    if (
      currentLevel === LEVEL_NAMES.LEVEL_3 ||
      currentLevel === LEVEL_NAMES.SANDBOX
    ) {
      const detectedPhrases = detectFilterList(
        reply.content,
        getFilterList(defences, DEFENCE_TYPES.FILTER_BOT_OUTPUT)
      );
      if (detectedPhrases.length > 0) {
        console.debug(
          `FILTER_USER_OUTPUT defence triggered. Detected phrases from blocklist: '${detectedPhrases.join(
            "', '"
          )}'.`
        );
        if (isDefenceActive(DEFENCE_TYPES.FILTER_BOT_OUTPUT, defences)) {
          chatResponse.defenceInfo.triggeredDefences.push(
            DEFENCE_TYPES.FILTER_BOT_OUTPUT
          );
          chatResponse.defenceInfo.isBlocked = true;
          chatResponse.defenceInfo.blockedReason =
            "My original response was blocked as it contained a restricted word/phrase. Ask me something else. ";
        } else {
          chatResponse.defenceInfo.alertedDefences.push(
            DEFENCE_TYPES.FILTER_BOT_OUTPUT
          );
        }
      }
    }
    // add the ai reply to the chat history
    chatHistory = pushCompletionToHistory(
      chatHistory,
      reply,
      defenceInfo.isBlocked
        ? CHAT_MESSAGE_TYPE.BOT_BLOCKED
        : CHAT_MESSAGE_TYPE.BOT
    );

    // log the entire chat history so far
    console.log(chatHistory);
    return chatResponse;
  }
}

export {
  chatGptSendMessage,
  filterChatHistoryByMaxTokens,
  getOpenAIKey,
  verifyKeySupportsModel,
};
