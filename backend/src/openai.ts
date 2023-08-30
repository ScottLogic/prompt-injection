import {
  isDefenceActive,
  getSystemRole,
  detectFilterList,
  getFilterList,
} from "./defence";
import { sendEmail, getEmailWhitelist, isEmailInWhitelist } from "./email";
import {
  initQAModel,
  initPromptEvaluationModel,
  queryDocuments,
} from "./langchain";
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
import { PHASE_NAMES } from "./models/phase";

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
      },
      required: ["address", "subject", "body"],
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
    console.debug("Error validating API key: " + error);
    return false;
  }
}

async function setOpenAiApiKey(
  openAiApiKey: string,
  gptModel: string,
  prePrompt: string,
  // default to sandbox mode
  currentPhase: PHASE_NAMES = PHASE_NAMES.SANDBOX
) {
  // initialise all models with the new key
  if (await validateApiKey(openAiApiKey, gptModel)) {
    console.debug("Setting API key and initialising models");
    initOpenAi(openAiApiKey);
    initQAModel(openAiApiKey, prePrompt, currentPhase);
    initPromptEvaluationModel(openAiApiKey);
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
  console.debug("Setting GPT model to: " + model);
  if (await validateApiKey(openAiApiKey, model)) {
    console.debug("Set GPT model to: " + model);
    return true;
  } else {
    console.debug("Could not validate openAiApiKey with model=" + model);
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
  currentPhase: PHASE_NAMES = PHASE_NAMES.SANDBOX
) {
  let reply: ChatCompletionRequestMessage | null = null;
  let wonPhase: boolean = false;
  // get the function name
  const functionName: string = functionCall.name || "";

  // check if we know the function
  if (isChatGptFunction(functionName)) {
    // get the function parameters
    const params = functionCall.arguments
      ? JSON.parse(functionCall.arguments)
      : {};
    console.debug("Function call: " + functionName);
    let response: string = "";

    // call the function
    if (functionName === "sendEmail") {
      let isAllowedToSendEmail = false;
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
        const emailResponse: EmailResponse = sendEmail(
          params.address,
          params.subject,
          params.body,
          currentPhase
        );
        response = emailResponse.response;
        wonPhase = emailResponse.wonPhase;
        sentEmails.push(emailResponse.sentEmail);
      }
    } else if (functionName == "getEmailWhitelist") {
      response = getEmailWhitelist(defences);
    }
    if (functionName === "askQuestion") {
      console.debug("Asking question: " + params.question);
      // if asking a question, call the queryDocuments
      response = (await queryDocuments(params.question)).reply;
    }

    reply = {
      role: "function",
      content: response,
      name: functionName,
    };
  } else {
    console.error("Unknown function: " + functionName);
  }

  if (reply) {
    return {
      completion: reply,
      defenceInfo: defenceInfo,
      wonPhase: wonPhase,
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
  currentPhase: PHASE_NAMES = PHASE_NAMES.SANDBOX
) {
  // check if we need to set a system role
  // system role is always active on phases
  if (
    currentPhase !== PHASE_NAMES.SANDBOX ||
    isDefenceActive(DEFENCE_TYPES.SYSTEM_ROLE, defences)
  ) {
    // check to see if there's already a system role
    if (!chatHistory.find((message) => message.completion?.role === "system")) {
      // add the system role to the start of the chat history
      chatHistory.unshift({
        completion: {
          role: "system",
          content: getSystemRole(defences, currentPhase),
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
    messages: getChatCompletionsFromHistory(chatHistory),
    functions: chatGptFunctions,
  });

  // get the reply
  return chat_completion.data.choices[0].message || null;
}

// take only the completions to send to GPT
const getChatCompletionsFromHistory = (
  chatHistory: ChatHistoryMessage[]
): ChatCompletionRequestMessage[] => {
  const completions: ChatCompletionRequestMessage[] =
    chatHistory.length > 0
      ? chatHistory
          .filter((message) => message.completion !== null)
          .map((message) => message.completion as ChatCompletionRequestMessage)
      : [];
  return completions;
};

const pushCompletionToHistory = (
  chatHistory: ChatHistoryMessage[],
  completion: ChatCompletionRequestMessage,
  isBlocked: boolean,
  isOriginalMessage: boolean = true
) => {
  const messageType =
    completion.role === "user"
      ? CHAT_MESSAGE_TYPE.USER
      : completion.role === "function" || completion.function_call
      ? CHAT_MESSAGE_TYPE.FUNCTION_CALL
      : CHAT_MESSAGE_TYPE.BOT;
  if (!isBlocked) {
    chatHistory.push({
      completion: completion,
      chatMessageType: messageType,
      isOriginalMessage: isOriginalMessage,
    });
  } else {
    console.log("Skipping adding blocked message to chat history", completion);
  }
  return chatHistory;
};

async function chatGptSendMessage(
  chatHistory: ChatHistoryMessage[],
  defences: DefenceInfo[],
  gptModel: CHAT_MODELS,
  message: string,
  isOriginalMessage: boolean,
  openAiApiKey: string,
  sentEmails: EmailInfo[],
  // default to sandbox
  currentPhase: PHASE_NAMES = PHASE_NAMES.SANDBOX
) {
  console.log(`User message: '${message}'`);

  // init defence info
  let defenceInfo: ChatDefenceReport = {
    blockedReason: "",
    isBlocked: false,
    alertedDefences: [],
    triggeredDefences: [],
  };
  let wonPhase: boolean | undefined | null = false;

  // add user message to chat
  chatHistory = pushCompletionToHistory(
    chatHistory,
    {
      role: "user",
      content: message,
    },
    defenceInfo.isBlocked,
    isOriginalMessage
  );

  const openai = getOpenAiFromKey(openAiApiKey);
  let reply = await chatGptChatCompletion(
    chatHistory,
    defences,
    gptModel,
    openai,
    currentPhase
  );
  // check if GPT wanted to call a function
  while (reply && reply.function_call) {
    chatHistory = pushCompletionToHistory(
      chatHistory,
      reply,
      defenceInfo.isBlocked
    );

    // call the function and get a new reply and defence info from
    const functionCallReply = await chatGptCallFunction(
      defenceInfo,
      defences,
      reply.function_call,
      sentEmails,
      currentPhase
    );
    if (functionCallReply) {
      wonPhase = functionCallReply.wonPhase;
      // add the function call to the chat history
      if (functionCallReply.completion !== undefined) {
        chatHistory = pushCompletionToHistory(
          chatHistory,
          functionCallReply.completion,
          defenceInfo.isBlocked
        );
      }
      // update the defence info
      defenceInfo = functionCallReply.defenceInfo;
    }
    // get a new reply from ChatGPT now that the function has been called
    reply = await chatGptChatCompletion(
      chatHistory,
      defences,
      gptModel,
      openai,
      currentPhase
    );
  }

  if (reply && reply.content) {
    // if output filter defence is active, check for blocked words/phrases
    if (
      currentPhase === PHASE_NAMES.PHASE_2 ||
      currentPhase === PHASE_NAMES.SANDBOX
    ) {
      const detectedPhrases = detectFilterList(
        reply.content,
        getFilterList(defences, DEFENCE_TYPES.FILTER_BOT_OUTPUT)
      );
      if (detectedPhrases.length > 0) {
        console.debug(
          "FILTER_USER_OUTPUT defence triggered. Detected phrases from blocklist: '" +
            detectedPhrases.join("', '") +
            "'."
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
    );

    // log the entire chat history so far
    console.log(chatHistory);

    return {
      completion: reply,
      defenceInfo: defenceInfo,
      wonPhase: wonPhase,
    };
  } else {
    return null;
  }
}

export { chatGptSendMessage, setOpenAiApiKey, validateApiKey, setGptModel };
