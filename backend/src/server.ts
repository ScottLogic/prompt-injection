import { env, exit } from "node:process";
import app from "./app";
import { initDocumentVectors } from "./langchain";
import { defaultChatModel } from "./models/chat";
import { verifyKeySupportsModel } from "./openai";

// by default runs on port 3001
const port = env.PORT ?? String(3001);

app.listen(port, () => {
  // Set API key from environment variable
  console.debug("Validating OpenAI API key...");
  const verifyKeyPromise = verifyKeySupportsModel(defaultChatModel.id).then(
    () => {
      console.debug("OpenAI initialized");
    }
  );

  // initialise the documents on app startup
  const vectorsPromise = initDocumentVectors()
    .then(() => {
      console.debug("Document vector store initialized");
    })
    .catch((err) => {
      throw new Error(`Error initializing document vectors: ${err}`);
    });

  Promise.all([verifyKeyPromise, vectorsPromise])
    .then(() => {
      console.log(`Server is running on port ${port}`);
    })
    .catch((err) => {
      console.error(err);
      exit(1);
    });
});
