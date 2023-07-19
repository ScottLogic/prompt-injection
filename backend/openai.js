const { Configuration, OpenAIApi } = require("openai");
const { isDefenceActive } = require("./defence");
const { sendEmail } = require("./email");

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
];

function initOpenAi() {
  configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  openai = new OpenAIApi(configuration);
}

// returns true if the function is in the list of functions available to ChatGPT
function isChatGptFunction(functionName) {
  return chatGptFunctions.find((func) => func.name === functionName);
}

async function chatGptCallFunction(functionCall) {
  reply = null;

  // get the function name
  functionName = functionCall.name;
  // check if we know the function
  if (isChatGptFunction(functionName)) {
    // get the function parameters
    const params = JSON.parse(functionCall.arguments);
    let response = null;

    // call the function
    if (functionName === "sendEmail") {
      sendEmail(params.email, params.subject, params.message);
      // we always send the email because it's a stub
      response = "Email sent";
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
      // recursively call the function and get a new reply
      reply = await chatGptCallFunction(reply.function_call);
    }
  } else {
    console.error("Unknown function: " + functionName);
  }
  return reply;
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
  console.table(chatGptMessages);
  return reply;
}

async function chatGptSendMessage(message) {
  // add message to chat
  chatGptMessages.push({ role: "user", content: message });

  let reply = await chatGptChatCompletion();

  // check if GPT wanted to call a function
  if (reply.function_call) {
    // call the function and get a new reply
    reply = await chatGptCallFunction(reply.function_call);
  }
  // return the reply content
  return { reply: reply.content };
}

// clear chat history
function clearMessages() {
  chatGptMessages = [];
}

module.exports = { initOpenAi, chatGptSendMessage, clearMessages };
