const { Configuration, OpenAIApi } = require("openai");
const { isDefenceActive } = require("./defence");
const { sendEmail, getEmailWhitelist, isEmailInWhitelist } = require("./email");

// OpenAI configuration
let configuration = null;
let openai = null;
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
  {
    name: "getEmailWhitelist",
    description:
      "Get the list of whitelisted email addresses allowed to send emails to",
    parameters: {
      type: "object",
      properties: {},
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

async function chatGptCallFunction(functionCall, defenceInfo, session) {
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
      let isAllowedToSendEmail = false;
      if (isEmailInWhitelist(params.address)) {
        isAllowedToSendEmail = true;
      } else {
        // trigger email defence even if it is not active
        defenceInfo.triggeredDefences.push("EMAIL_WHITELIST");
        if (isDefenceActive("EMAIL_WHITELIST", session.activeDefences)) {
          // do not send email if defence is on and set to blocked
          response = "Cannot send to this email as it is not whitelisted";
          defenceInfo.blocked = true;
        } else {
          // send email if defence is not active
          isAllowedToSendEmail = true;
        }
      }

      if (isAllowedToSendEmail) {
        response = sendEmail(
          params.address,
          params.subject,
          params.body,
          session
        );
      }
    } else if (functionName == "getEmailWhitelist") {
      response = getEmailWhitelist();
    }
    reply = {
      role: "function",
      content: response,
      name: functionName,
    };
  } else {
    console.error("Unknown function: " + functionName);
  }
  return { reply, defenceInfo };
}

async function chatGptChatCompletion(session) {
  // check if we need to set a system role
  if (isDefenceActive("SYSTEM_ROLE", session.activeDefences)) {
    // check to see if there's already a system role
    if (!session.chatHistory.find((message) => message.role === "system")) {
      // add the system role to the start of the chat history
      session.chatHistory.unshift({
        role: "system",
        content: process.env.SYSTEM_ROLE,
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
    throw new Error("OpenAI has not been initialised");
  }

  chat_completion = await openai.createChatCompletion({
    model: "gpt-4",
    messages: session.chatHistory,
    functions: chatGptFunctions,
  });
  // get the reply
  return chat_completion.data.choices[0].message;
}

async function chatGptSendMessage(message, session) {
  // init defence info
  let defenceInfo = { triggeredDefences: [], blocked: false };
  // add user message to chat
  session.chatHistory.push({ role: "user", content: message });

  let reply = await chatGptChatCompletion(session);
  // check if GPT wanted to call a function
  while (reply.function_call) {
    // call the function and get a new reply and defence info from
    const functionCallReply = await chatGptCallFunction(
      reply.function_call,
      defenceInfo,
      session
    );
    // add the function call to the chat history
    session.chatHistory.push(functionCallReply.reply);
    // update the defence info
    defenceInfo = functionCallReply.defenceInfo;
    // get a new reply from ChatGPT now that the function has been called
    reply = await chatGptChatCompletion(session);
  }
  // add the ai reply to the chat history
  session.chatHistory.push(reply);

  // log the entire chat history so far
  console.log(session.chatHistory);
  // return the reply content
  return { reply: reply.content, defenceInfo: defenceInfo };
}

module.exports = { initOpenAi, chatGptSendMessage };
