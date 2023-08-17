import { AxiosResponse } from "axios";
import { ChatCompletion, ChatDefenceReport, ChatResponse } from "./types/chat";
import { EmailResponse } from "./types/email";
import { Session } from "./types/session";

const {
  Configuration,
  OpenAIApi,
  CreateChatCompletionResponse,
} = require("openai");
const { isDefenceActive, getSystemRole } = require("./defence");
const { sendEmail, getEmailWhitelist, isEmailInWhitelist } = require("./email");
const {
  initQAModel,
  initPromptEvaluationModel,
  queryDocuments,
  queryPromptEvaluationModel,
} = require("./langchain");

// OpenAI config
let config: typeof Configuration = null;
let openai: typeof OpenAIApi = null;

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
    const testOpenAI: typeof OpenAIApi = new OpenAIApi(
      new Configuration({ apiKey: apiKey })
    );
    const response: AxiosResponse<typeof CreateChatCompletionResponse, any> =
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
  session: Session,
  apiKey: any
): Promise<boolean> => {
  // initialise all models with the new key
  if (await validateApiKey(apiKey, session.gptModel)) {
    console.debug("Setting API key and initialising models");
    session.apiKey = apiKey;
    initOpenAi(session);
    initQAModel(session, 3);
    initPromptEvaluationModel(session);
    return true;
  } else {
    // set to empty in case it was previously set
    console.debug("Invalid API key. Cannot initialise OpenAI models");
    session.apiKey = "";
    openai = null;
    return false;
  }
};

const initOpenAi = (session: Session): void => {
  config = new Configuration({
    apiKey: session.apiKey,
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
  functionCall: any,
  defenceInfo: ChatDefenceReport,
  currentPhase: number,
  session: Session
): Promise<ChatResponse> => {
  let reply: ChatCompletion = {} as ChatCompletion;
  let wonPhase: boolean | null = null;
  // get the function name
  const functionName: string = functionCall.name;

  // check if we know the function
  if (isChatGptFunction(functionName)) {
    // get the function parameters
    const params = JSON.parse(functionCall.arguments);
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
          response = "Cannot send to this email as it is not whitelisted";
          defenceInfo.blocked = true;
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
  return {
    reply: reply.content,
    wonPhase: wonPhase,
    defenceInfo: defenceInfo,
    completion: reply,
  };
};

const chatGptChatCompletion = async (
  session: Session,
  currentPhase: number
): Promise<ChatCompletion> => {
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

  const chat_completion: AxiosResponse<
    typeof CreateChatCompletionResponse,
    any
  > = await openai.createChatCompletion({
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
): Promise<ChatResponse> => {
  // init defence info
  let defenceInfo: ChatDefenceReport = {
    triggeredDefences: [],
    blocked: false,
  };
  let wonPhase: boolean | undefined | null = false;

  // evaluate the message for prompt injection
  // to speed up replies, only do this on phases where defences are active
  if (currentPhase >= 2) {
    const evalPrompt = await queryPromptEvaluationModel(message);
    if (evalPrompt.isMalicious) {
      defenceInfo.triggeredDefences.push("LLM_EVALUATION");
      if (isDefenceActive("LLM_EVALUATION", session.defences)) {
        console.debug("LLM evalutation defence active.");
        defenceInfo.blocked = true;
        const evalResponse =
          "Message blocked by the malicious prompt evaluator." +
          evalPrompt.reason;
        return { reply: evalResponse, defenceInfo: defenceInfo };
      }
    }
  }

  // add user message to chat
  session.chatHistory.push({ role: "user", content: message });

  let reply: ChatCompletion = await chatGptChatCompletion(
    session,
    currentPhase
  );
  // check if GPT wanted to call a function
  while (reply.function_call) {
    session.chatHistory.push(reply);

    // call the function and get a new reply and defence info from
    const functionCallReply: ChatResponse = await chatGptCallFunction(
      reply.function_call,
      defenceInfo,
      currentPhase,
      session
    );
    wonPhase = functionCallReply.wonPhase;
    // add the function call to the chat history
    if (functionCallReply.completion !== undefined) {
      session.chatHistory.push(functionCallReply.completion);
    }
    // update the defence info
    defenceInfo = functionCallReply.defenceInfo;

    // get a new reply from ChatGPT now that the function has been called
    reply = await chatGptChatCompletion(session, currentPhase);
  }
  // add the ai reply to the chat history
  session.chatHistory.push(reply);

  // log the entire chat history so far
  console.log(session.chatHistory);
  // return the reply content
  return {
    reply: reply.content,
    wonPhase: wonPhase,
    defenceInfo: defenceInfo,
    completion: reply,
  };
};

module.exports = {
  initOpenAi,
  chatGptSendMessage,
  setOpenAiApiKey,
  validateApiKey,
  setGptModel,
};
