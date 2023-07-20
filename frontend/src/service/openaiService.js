import { sendRequest } from "./backendService";

const PATH = "openai/";

async function clearOpenAiChat() {
  const response = await sendRequest(PATH + "clear", "POST");
  return response.status === 200;
}

async function openAiSendMessage(message) {
  const response = await sendRequest(
    PATH + "chat",
    "POST",
    { "Content-Type": "application/json" },
    JSON.stringify({ message })
  );
  const data = await response.json();
  console.log(data);
  return data;
}

export { clearOpenAiChat, openAiSendMessage };
