const { Configuration, OpenAIApi } = require("openai");

let configuration = null;
let openai = null;
const chatGptMessages = [];

function initOpenAi() {
  configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  openai = new OpenAIApi(configuration);
}

async function chatGptSendMessage(message) {
  // add message to chat
  chatGptMessages.push({ role: "user", content: message });
  const chat_completion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: chatGptMessages,
  });
  const reply = chat_completion.data.choices[0].message;
  // add reply to chat
  chatGptMessages.push(reply);
  // return the reply content
  return reply.content;
}

function clearMessages() {
  chatGptMessages.length = 0;
}

module.exports = { initOpenAi, chatGptSendMessage, clearMessages };
