import app from "./app";
import { initDocumentVectors } from "./langchain";
import { setOpenAiApiKey } from "./openai";
import { defaultChatModel } from "./models/chat";

// by default runs on port 3001
const port = process.env.PORT ?? String(3001);

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);

  // initialise the documents on app startup
  initDocumentVectors()
    .then(() => {
      console.debug("Document vectors initialised");
    })
    .catch((err) => {
      console.error("Error initialising document vectors", err);
    });

  // for dev purposes only - set the API key from the environment variable
  const envOpenAiKey = process.env.OPENAI_API_KEY;
  if (envOpenAiKey) {
    console.debug("Initializing models with API key from environment variable");
    // asynchronously set the API key
    void setOpenAiApiKey(envOpenAiKey, defaultChatModel.id).then(() => {
      console.debug("OpenAI models initialized");
    });
  }
});
