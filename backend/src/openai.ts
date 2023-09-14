import {
  isDefenceActive,
  getSystemRole,
  detectFilterList,
  getFilterList,
  getQALLMprePrompt,
} from "./defence";
import { sendEmail, getEmailWhitelist, isEmailInWhitelist } from "./email";
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
} from "./models/chat";
import { DEFENCE_TYPES, DefenceInfo } from "./models/defence";
import { LEVEL_NAMES } from "./models/level";
import {
  FunctionAskQuestionParams,
  FunctionSendEmailParams,
} from "./models/openai";
import { get_encoding } from "@dqbd/tiktoken";

// OpenAI config
let config: Configuration | null = null;

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
  // {
  //   name: "getEmailWhitelist",
  //   description:
  //     "user asks who is on the email whitelist and the system replies with the list of emails.",
  //   parameters: {
  //     type: "object",
  //     properties: {},
  //   },
  // },
  {
    name: "askQuestion",
    description:
      "Ask a question about the documents with company and project information ",
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
  [CHAT_MODELS.GPT_4]: 8192,
  [CHAT_MODELS.GPT_4_0613]: 8192,
  [CHAT_MODELS.GPT_4_32K]: 32768,
  [CHAT_MODELS.GPT_4_32K_0613]: 32768,
  [CHAT_MODELS.GPT_3_5_TURBO]: 4097,
  [CHAT_MODELS.GPT_3_5_TURBO_0613]: 4097,
  [CHAT_MODELS.GPT_3_5_TURBO_16K]: 16385,
  [CHAT_MODELS.GPT_3_5_TURBO_16K_0613]: 16385,
};

// test the api key works with the model
async function validateApiKey(openAiApiKey: string, gptModel: string) {
  try {
    const testOpenAI: OpenAIApi = new OpenAIApi(
      new Configuration({ apiKey: openAiApiKey })
    );
    await testOpenAI.createChatCompletion({
      model: gptModel,
      messages: [{ role: "user", content: "this is a test prompt" }],
    });
    return true;
  } catch (error) {
    if (error instanceof Error) {
      console.debug(`Error validating API key: ${error.message}`);
    }
    return false;
  }
}

async function setOpenAiApiKey(openAiApiKey: string, gptModel: string) {
  // initialise models with the new key
  if (await validateApiKey(openAiApiKey, gptModel)) {
    console.debug("Setting API key and initialising models");
    initOpenAi(openAiApiKey);
    return true;
  } else {
    // set to empty in case it was previously set
    console.debug("Invalid API key. Cannot initialise OpenAI models");
    return false;
  }
}

function initOpenAi(openAiApiKey: string) {
  // make sure it's possible to get OpenAiApi object from the key
  getOpenAiFromKey(openAiApiKey);
  console.debug("OpenAI initialised");
}

function getOpenAiFromKey(openAiApiKey: string) {
  config = new Configuration({
    apiKey: openAiApiKey,
  });
  const openai = new OpenAIApi(config);
  return openai;
}

async function setGptModel(openAiApiKey: string, model: CHAT_MODELS) {
  console.debug(`Setting GPT model to: ${model}`);
  if (await validateApiKey(openAiApiKey, model)) {
    console.debug(`Set GPT model to: ${model}`);
    return true;
  } else {
    console.debug(`Could not validate openAiApiKey with model=${model}`);
    return false;
  }
}

// returns true if the function is in the list of functions available to ChatGPT
function isChatGptFunction(functionName: string) {
  return chatGptFunctions.find((func) => func.name === functionName);
}

async function chatGptCallFunction(
  defenceInfo: ChatDefenceReport,
  defences: DefenceInfo[],
  functionCall: ChatCompletionRequestMessageFunctionCall,
  sentEmails: EmailInfo[],
  // default to sandbox
  currentLevel: LEVEL_NAMES = LEVEL_NAMES.SANDBOX,
  openAiApiKey: string
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
      let isAllowedToSendEmail = false;
      if (functionCall.arguments) {
        const params = JSON.parse(
          functionCall.arguments
        ) as FunctionSendEmailParams;
        if (isEmailInWhitelist(params.address, defences)) {
          isAllowedToSendEmail = true;
        } else {
          if (isDefenceActive(DEFENCE_TYPES.EMAIL_WHITELIST, defences)) {
            defenceInfo.triggeredDefences.push(DEFENCE_TYPES.EMAIL_WHITELIST);
            // do not send email if defence is on and set to blocked
            defenceInfo.isBlocked = true;
            defenceInfo.blockedReason =
              "Cannot send to this email as it is not whitelisted";
          } else {
            defenceInfo.alertedDefences.push(DEFENCE_TYPES.EMAIL_WHITELIST);
            // send email if defence is not active
            isAllowedToSendEmail = true;
          }
        }

        if (isAllowedToSendEmail) {
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
      } else {
        console.error("No arguments provided to sendEmail function");
      }
    } else if (functionName == "getEmailWhitelist") {
      response = getEmailWhitelist(defences);
    }
    if (functionName === "askQuestion") {
      if (functionCall.arguments) {
        const params = JSON.parse(
          functionCall.arguments
        ) as FunctionAskQuestionParams;
        console.debug(`Asking question: ${params.question}`);
        // if asking a question, call the queryDocuments
        let qaPrompt = "";
        if (isDefenceActive(DEFENCE_TYPES.QA_LLM_INSTRUCTIONS, defences)) {
          qaPrompt = getQALLMprePrompt(defences);
        }
        response = (
          await queryDocuments(
            params.question,
            qaPrompt,
            currentLevel,
            openAiApiKey
          )
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
      defenceInfo: defenceInfo,
      wonLevel: wonLevel,
    };
  } else {
    return null;
  }
}

async function chatGptChatCompletion(
  chatHistory: ChatHistoryMessage[],
  defences: DefenceInfo[],
  gptModel: CHAT_MODELS,
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
    // check to see if there's already a system role
    if (!chatHistory.find((message) => message.completion?.role === "system")) {
      // add the system role to the start of the chat history
      chatHistory.unshift({
        completion: {
          role: "system",
          content: getSystemRole(defences, currentLevel),
        },
        chatMessageType: CHAT_MESSAGE_TYPE.SYSTEM,
      });
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
  const chat_completion = await openai.createChatCompletion({
    model: gptModel,
    messages: getChatCompletionsFromHistory(chatHistory, gptModel),
    functions: chatGptFunctions,
  });

  // get the reply
  return chat_completion.data.choices[0].message ?? null;
}

// take only the chat history to send to GPT that is within the max tokens
function filterChatHistoryByMaxTokens(
  list: ChatHistoryMessage[],
  maxNumTokens: number
): ChatHistoryMessage[] {
  let sumTokens = 0;
  const filteredList: ChatHistoryMessage[] = [];

  // reverse list to add from most recent
  const reverseList = list.slice().reverse();

  // always add the most recent message to start of list
  filteredList.push(reverseList[0]);
  sumTokens += reverseList[0].numTokens ?? 0;

  // if the first message is a system role add it to list
  if (list[0].completion?.role === "system") {
    sumTokens += list[0].numTokens ?? 0;
    filteredList.push(list[0]);
  }

  // add elements after first message until max tokens reached
  for (let i = 1; i < reverseList.length; i++) {
    const element = reverseList[i];
    if (element.completion && element.numTokens) {
      // if we reach end and system role is there skip as it's already been added
      if (element.completion.role === "system") {
        continue;
      }
      if (sumTokens + element.numTokens <= maxNumTokens) {
        filteredList.splice(i, 0, element);
        sumTokens += element.numTokens;
      } else {
        console.debug("max tokens reached on element = ", element);
        break;
      }
    }
  }
  return filteredList.reverse();
}

// take only the completions to send to GPT
function getChatCompletionsFromHistory(
  chatHistory: ChatHistoryMessage[],
  gptModel: CHAT_MODELS
): ChatCompletionRequestMessage[] {
  // limit the number of tokens sent to GPT
  const maxTokens = chatModelMaxTokens[gptModel];
  console.log("gpt model = ", gptModel, "max tokens = ", maxTokens);

  const reducedChatHistory: ChatHistoryMessage[] = filterChatHistoryByMaxTokens(
    chatHistory,
    maxTokens
  );
  const completions: ChatCompletionRequestMessage[] =
    reducedChatHistory.length > 0
      ? (reducedChatHistory
          .filter((message) => message.completion !== null)
          .map(
            (message) => message.completion
          ) as ChatCompletionRequestMessage[])
      : [];
  return completions;
}

function pushCompletionToHistory(
  chatHistory: ChatHistoryMessage[],
  completion: ChatCompletionRequestMessage,
  messageType: CHAT_MESSAGE_TYPE
) {
  // limit the length of the chat history
  const maxChatHistoryLength = 1000;

  // gpt-4 and 3.5 models use cl100k_base encoding
  const encoding = get_encoding("cl100k_base");

  if (messageType !== CHAT_MESSAGE_TYPE.BOT_BLOCKED) {
    // remove the oldest message, not including system role message
    if (chatHistory.length >= maxChatHistoryLength) {
      if (chatHistory[0].completion?.role !== "system") {
        chatHistory.shift();
      } else {
        chatHistory.splice(1, 1);
      }
    }
    chatHistory.push({
      completion: completion,
      chatMessageType: messageType,
      numTokens: completion.content
        ? encoding.encode(completion.content).length
        : null,
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
  gptModel: CHAT_MODELS,
  message: string,
  messageIsTransformed: boolean,
  openAiApiKey: string,
  sentEmails: EmailInfo[],
  // default to sandbox
  currentLevel: LEVEL_NAMES = LEVEL_NAMES.SANDBOX
) {
  console.log(`User message: '${message}'`);

  // init defence info
  let defenceInfo: ChatDefenceReport = {
    blockedReason: "",
    isBlocked: false,
    alertedDefences: [],
    triggeredDefences: [],
  };
  let wonLevel: boolean | undefined | null = false;

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

  const openai = getOpenAiFromKey(openAiApiKey);
  let reply = await chatGptChatCompletion(
    chatHistory,
    defences,
    gptModel,
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
      currentLevel,
      openAiApiKey
    );
    if (functionCallReply) {
      wonLevel = functionCallReply.wonLevel;
      // add the function call to the chat history
      chatHistory = pushCompletionToHistory(
        chatHistory,
        functionCallReply.completion,
        CHAT_MESSAGE_TYPE.FUNCTION_CALL
      );
      // update the defence info
      defenceInfo = functionCallReply.defenceInfo;
    }
    // get a new reply from ChatGPT now that the function has been called
    reply = await chatGptChatCompletion(
      chatHistory,
      defences,
      gptModel,
      openai,
      currentLevel
    );
  }

  if (reply?.content) {
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
          defenceInfo.triggeredDefences.push(DEFENCE_TYPES.FILTER_BOT_OUTPUT);
          defenceInfo.isBlocked = true;
          defenceInfo.blockedReason =
            "My original response was blocked as it contained a restricted word/phrase. Ask me something else. ";
        } else {
          defenceInfo.alertedDefences.push(DEFENCE_TYPES.FILTER_BOT_OUTPUT);
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

    return {
      completion: reply,
      defenceInfo: defenceInfo,
      wonLevel: wonLevel,
    };
  } else {
    return null;
  }
}

export {
  chatGptSendMessage,
  filterChatHistoryByMaxTokens,
  setOpenAiApiKey,
  validateApiKey,
  setGptModel,
};
