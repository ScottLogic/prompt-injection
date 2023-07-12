async function openAiChat(message) {
  const response = await fetch("http://localhost:3001/openai/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message }),
  });
  const data = await response.text();
  return data;
}

export { openAiChat };
