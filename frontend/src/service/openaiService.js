const URL = "http://localhost:3001/openai/";

async function clearOpenAiChat() {
  const response = await fetch(URL + "clear", {
    method: "POST",
  });
  return response.status === 200;
}

async function openAiSendMessage(message) {
  const response = await fetch(URL + "chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message }),
  });
  const data = await response.json();
  console.log(data);
  return data;
}

export { clearOpenAiChat, openAiSendMessage };
