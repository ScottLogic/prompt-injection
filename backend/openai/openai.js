const { Configuration, OpenAIApi } = require("openai");

let configuration = null;
let openai = null;

function initOpenAi() {
  configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  openai = new OpenAIApi(configuration);
}

async function chatGptSendMessage(message) {
  const chat_completion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: message }],
  });
  console.log(chat_completion.data);
  return chat_completion.data.choices[0].message.content;
}

module.exports = { initOpenAi, chatGptSendMessage };
