import { Session } from "express-session";

import { isDefenceActive, getSystemRole } from "./defence";
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
  ChatCompletionResponseMessage,
  Configuration,
  OpenAIApi,
} from "openai";
import { CHAT_MODELS, ChatDefenceReport, ChatResponse } from "./models/chat";
import { DefenceInfo } from "./models/defence";
import { PHASE_NAMES } from "./models/phase";

// OpenAI config
let config: Configuration | null = null;
let openai: OpenAIApi | null = null;

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
const validateApiKey = async (
  apiKey: string,
  gptModel: string
): Promise<boolean> => {
  try {
    const testOpenAI: OpenAIApi = new OpenAIApi(
      new Configuration({ apiKey: apiKey })
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
};

const setOpenAiApiKey = async (
  apiKey: string,
  gptModel: string,
  prePrompt: string,
  // default to sandbox mode
  currentPhase: PHASE_NAMES = PHASE_NAMES.SANDBOX
): Promise<boolean> => {
  // initialise all models with the new key
  if (await validateApiKey(apiKey, gptModel)) {
    console.debug("Setting API key and initialising models");
    initOpenAi(apiKey);
    initQAModel(apiKey, prePrompt, currentPhase);
    initPromptEvaluationModel(apiKey);
    return true;
  } else {
    // set to empty in case it was previously set
    console.debug("Invalid API key. Cannot initialise OpenAI models");
    openai = null;
    return false;
  }
};

const initOpenAi = (openAiApiKey: string): void => {
  config = new Configuration({
    apiKey: openAiApiKey,
  });
  openai = new OpenAIApi(config);
  console.debug("OpenAI initialised");
};

const setGptModel = async (
  session: Session,
  model: CHAT_MODELS
): Promise<boolean> => {
  if (model !== session.gptModel) {
    if (await validateApiKey(session.apiKey, model)) {
      console.debug(
        "Setting GPT model from: " + session.gptModel + " to: " + model
      );
      session.gptModel = model;
      return true;
    } else {
      console.debug("Could not validate apiKey with model=" + model);
      return false;
    }
  }
  return false;
};

// returns true if the function is in the list of functions available to ChatGPT
const isChatGptFunction = (functionName: string) => {
  return chatGptFunctions.find((func) => func.name === functionName);
};

const chatGptCallFunction = async (
  defenceInfo: ChatDefenceReport,
  defences: DefenceInfo[],
  functionCall: ChatCompletionRequestMessageFunctionCall,
  sentEmails: EmailInfo[],
  // default to sandbox
  currentPhase: PHASE_NAMES = PHASE_NAMES.SANDBOX
): Promise<ChatResponse | null> => {
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
        // trigger email defence even if it is not active
        defenceInfo.triggeredDefences.push("EMAIL_WHITELIST");
        if (isDefenceActive("EMAIL_WHITELIST", defences)) {
          // do not send email if defence is on and set to blocked
          defenceInfo.isBlocked = true;
          defenceInfo.blockedReason =
            "Cannot send to this email as it is not whitelisted";
        } else {
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
        // add the sent email to the session
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
};

const chatGptChatCompletion = async (
  chatHistory: ChatCompletionRequestMessage[],
  defences: DefenceInfo[],
  gptModel: CHAT_MODELS,
  // default to sandbox
  currentPhase: PHASE_NAMES = PHASE_NAMES.SANDBOX
): Promise<ChatCompletionResponseMessage | null> => {
  // check if we need to set a system role
  // system role is always active on phases
  if (
    currentPhase !== PHASE_NAMES.SANDBOX ||
    isDefenceActive("SYSTEM_ROLE", defences)
  ) {
    // check to see if there's already a system role
    if (!chatHistory.find((message) => message.role === "system")) {
      // add the system role to the start of the chat history
      chatHistory.unshift({
        role: "system",
        content: getSystemRole(defences, currentPhase),
      });
    }
  } else {
    // remove the system role from the chat history
    while (chatHistory.length > 0 && chatHistory[0].role === "system") {
      chatHistory.shift();
    }
  }

  // make sure openai has been initialised
  if (!openai) {
    console.debug("OpenAI not initialised with api key");
    return {
      role: "assistant",
      content: "Please enter a valid OpenAI API key to chat to me!",
    };
  }

  const chat_completion = await openai.createChatCompletion({
    model: gptModel,
    messages: chatHistory,
    functions: chatGptFunctions,
  });

  // get the reply
  return chat_completion.data.choices[0].message || null;
};

const chatGptSendMessage = async (
  chatHistory: ChatCompletionRequestMessage[],
  defences: DefenceInfo[],
  gptModel: CHAT_MODELS,
  message: string,
  sentEmails: EmailInfo[],
  // default to sandbox
  currentPhase: PHASE_NAMES = PHASE_NAMES.SANDBOX
): Promise<ChatResponse | null> => {
  // init defence info
  let defenceInfo: ChatDefenceReport = {
    blockedReason: "",
    isBlocked: false,
    triggeredDefences: [],
  };
  let wonPhase: boolean | undefined | null = false;

  // add user message to chat
  chatHistory.push({ role: "user", content: message });

  let reply = await chatGptChatCompletion(
    chatHistory,
    defences,
    gptModel,
    currentPhase
  );
  // check if GPT wanted to call a function
  while (reply && reply.function_call) {
    chatHistory.push(reply);

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
        chatHistory.push(functionCallReply.completion);
      }
      // update the defence info
      defenceInfo = functionCallReply.defenceInfo;
    }

    // get a new reply from ChatGPT now that the function has been called
    reply = await chatGptChatCompletion(
      chatHistory,
      defences,
      gptModel,
      currentPhase
    );
  }

  if (reply && reply.content) {
    // add the ai reply to the chat history
    chatHistory.push(reply);
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
};

export {
  initOpenAi,
  chatGptSendMessage,
  setOpenAiApiKey,
  validateApiKey,
  setGptModel,
};
