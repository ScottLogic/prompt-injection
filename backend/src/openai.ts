import { Session } from "express-session";

import { isDefenceActive, getSystemRole } from "./defence";
import { sendEmail, getEmailWhitelist, isEmailInWhitelist } from "./email";
import {
  initQAModel,
  initPromptEvaluationModel,
  queryDocuments,
} from "./langchain";
import { EmailResponse } from "./models/email";
import {
  ChatCompletionRequestMessage,
  ChatCompletionRequestMessageFunctionCall,
  ChatCompletionResponseMessage,
  Configuration,
  OpenAIApi,
} from "openai";
import { ChatDefenceReport, ChatResponse } from "./models/chat";

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
  currentPhase: number,
  gptModel: string,
  prePrompt: string
): Promise<boolean> => {
  // initialise all models with the new key
  if (await validateApiKey(apiKey, gptModel)) {
    console.debug("Setting API key and initialising models");
    initOpenAi(apiKey);
    initQAModel(apiKey, currentPhase, prePrompt);
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
  model: string
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
  functionCall: ChatCompletionRequestMessageFunctionCall,
  defenceInfo: ChatDefenceReport,
  currentPhase: number,
  session: Session
): Promise<ChatResponse | null> => {
  let reply: ChatCompletionRequestMessage | null = null;
  let wonPhase: boolean | null = null;
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
      if (isEmailInWhitelist(params.address, session.defences)) {
        isAllowedToSendEmail = true;
      } else {
        // trigger email defence even if it is not active
        defenceInfo.triggeredDefences.push("EMAIL_WHITELIST");
        if (isDefenceActive("EMAIL_WHITELIST", session.defences)) {
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
          session,
          currentPhase
        );
        response = emailResponse.response;
        wonPhase = emailResponse.wonPhase;
      }
    } else if (functionName == "getEmailWhitelist") {
      response = getEmailWhitelist(session.defences);
    }
    if (functionName === "askQuestion") {
      console.debug("Asking question: " + params.question);
      // if asking a question, call the queryDocuments
      response = (await queryDocuments(params.question)).reply;
    }

    // add function call to chat
    reply = {
      role: "function",
      content: response,
      name: functionName,
    };
  } else {
    console.error("Unknown function: " + functionName);
  }

  if (reply && reply.content) {
    return {
      reply: reply.content,
      wonPhase: wonPhase,
      defenceInfo: defenceInfo,
      completion: reply,
    };
  } else {
    return null;
  }
};

const chatGptChatCompletion = async (
  session: Session,
  currentPhase: number
): Promise<ChatCompletionResponseMessage | undefined> => {
  // check if we need to set a system role
  // system role is always active on phases
  if (currentPhase <= 2 || isDefenceActive("SYSTEM_ROLE", session.defences)) {
    // check to see if there's already a system role
    if (!session.chatHistory.find((message) => message.role === "system")) {
      // add the system role to the start of the chat history
      session.chatHistory.unshift({
        role: "system",
        content: getSystemRole(session.defences, currentPhase),
      });
    }
  } else {
    // remove the system role from the chat history
    session.chatHistory = session.chatHistory.filter(
      (message) => message.role !== "system"
    );
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
    model: session.gptModel,
    messages: session.chatHistory,
    functions: chatGptFunctions,
  });

  // get the reply
  return chat_completion.data.choices[0].message;
};

const chatGptSendMessage = async (
  message: string,
  session: Session,
  currentPhase: number
): Promise<ChatResponse | null> => {
  // init defence info
  let defenceInfo: ChatDefenceReport = {
    blockedReason: "",
    isBlocked: false,
    triggeredDefences: [],
  };
  let wonPhase: boolean | undefined | null = false;

  // add user message to chat
  session.chatHistory.push({ role: "user", content: message });

  let reply = await chatGptChatCompletion(session, currentPhase);
  // check if GPT wanted to call a function
  while (reply && reply.function_call) {
    session.chatHistory.push(reply);

    // call the function and get a new reply and defence info from
    const functionCallReply = await chatGptCallFunction(
      reply.function_call,
      defenceInfo,
      currentPhase,
      session
    );
    if (functionCallReply) {
      wonPhase = functionCallReply.wonPhase;
      // add the function call to the chat history
      if (functionCallReply.completion !== undefined) {
        session.chatHistory.push(functionCallReply.completion);
      }
      // update the defence info
      defenceInfo = functionCallReply.defenceInfo;
    }

    // get a new reply from ChatGPT now that the function has been called
    reply = await chatGptChatCompletion(session, currentPhase);
  }

  if (reply && reply.content) {
    // add the ai reply to the chat history
    session.chatHistory.push(reply);
    // log the entire chat history so far
    console.log(session.chatHistory);
    return {
      reply: reply.content,
      wonPhase: wonPhase,
      defenceInfo: defenceInfo,
      completion: reply,
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
