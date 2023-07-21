const { Configuration, OpenAIApi } = require("openai");
const { isDefenceActive, isEmailInWhitelist } = require("./defence");
const { sendEmail, getEmailWhitelist } = require("./email");

// OpenAI configuration
let configuration = null;
let openai = null;
// chat history
let chatGptMessages = [];
// functions available to ChatGPT
const chatGptFunctions = [
  {
    name: "sendEmail",
    description: "Send an email to someone",
    parameters: {
      type: "object",
      properties: {
        email: {
          type: "string",
          description: "The email address to send the email to",
        },
        subject: {
          type: "string",
          description: "The subject of the email",
        },
        message: {
          type: "string",
          description: "The body of the email",
        },
      },
      required: ["email", "subject", "message"],
    },
  },
  {
    name: "getEmailWhitelist",
    description: "Get the list of whitelisted email addresses allowed to send emails to",
    parameters: {
      type: "object",
      properties: {}
      }
    }
];

function initOpenAi() {
  configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  openai = new OpenAIApi(configuration);

  console.debug("OpenAI initialised, api key: " + process.env.OPENAI_API_KEY);
}

// returns true if the function is in the list of functions available to ChatGPT
function isChatGptFunction(functionName) {
  return chatGptFunctions.find((func) => func.name === functionName);
}

async function chatGptCallFunction(functionCall, defenceInfo = { triggeredDefences: [], blocked: false }) {
  let reply = null;

  // get the function name
  const functionName = functionCall.name;

  // check if we know the function
  if (isChatGptFunction(functionName)) {
    // get the function parameters
    const params = JSON.parse(functionCall.arguments);
    let response = null;

    // call the function
    if (functionName === "sendEmail") {
      if (isEmailInWhitelist(params.email)) {
        response = sendEmail(params.email, params.subject, params.message);
      } else {
        // trigger email defence even if it is not active
        defenceInfo.triggeredDefences.push("EMAIL_WHITELIST");
        if (isDefenceActive("EMAIL_WHITELIST")) {
          // do not send email if defence is on and set to blocked
          response = "Cannot send to this email as it is not whitelisted";
          defenceInfo.blocked = true;
        } else {
          // send email if defence is not active
          response = sendEmail(params.email, params.subject, params.message);
        }
      }
    }

    if (functionName == "getEmailWhitelist"){
      response = getEmailWhitelist();
    }
    // add function call to chat
    chatGptMessages.push({
      role: "function",
      content: response,
      name: functionName,
    });

    // get a new reply from ChatGPT now that the function has been called
    reply = await chatGptChatCompletion();

    // check for another function call
    if (reply.function_call) {
      // recursively call the function and get a new reply, passing the updated defenceInfo
      const { reply: recursiveReply, defenceInfo: updatedDefenceInfo } = await chatGptCallFunction(reply.function_call, defenceInfo);
      reply = recursiveReply;
      defenceInfo = updatedDefenceInfo;
    }
  } else {
    console.error("Unknown function: " + functionName);
  }
  return { reply, defenceInfo };
}

async function chatGptChatCompletion() {
  // check if we need to set a system role
  if (isDefenceActive("SYSTEM_ROLE")) {
    // check to see if there's already a system role
    if (!chatGptMessages.find((message) => message.role === "system")) {
      // add the system role to the start of the chat history
      chatGptMessages.unshift({
        role: "system",
        content: process.env.SYSTEM_ROLE,
      });
    }
  } else {
    // remove the system role from the chat history
    chatGptMessages = chatGptMessages.filter(
      (message) => message.role !== "system"
    );
  }

  chat_completion = await openai.createChatCompletion({
    model: "gpt-4",
    messages: chatGptMessages,
    functions: chatGptFunctions,
  });
  // get the reply
  reply = chat_completion.data.choices[0].message;
  // add the reply to the chat history
  chatGptMessages.push(reply);
  // log and return the reply
  console.log(chatGptMessages);
  return reply;
}

async function chatGptSendMessage(message) {
  // init defence info 
  let defenceInfo = { triggeredDefences: [], blocked: false };
  // add message to chat
  chatGptMessages.push({ role: "user", content: message });

  let reply = await chatGptChatCompletion();

  // check if GPT wanted to call a function
  if (reply.function_call) {

    // call the function and get a new reply and defence info from
    const functionCallReply = await chatGptCallFunction(reply.function_call);
    return {reply: functionCallReply.reply.content, defenceInfo: functionCallReply.defenceInfo};
  }
  // return the reply content
  return { reply: reply.content, defenceInfo: defenceInfo };
}

// clear chat history
function clearMessages() {
  chatGptMessages = [];
}

module.exports = { initOpenAi, chatGptSendMessage, clearMessages };
