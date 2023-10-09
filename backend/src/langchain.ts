import { RetrievalQAChain, LLMChain, SequentialChain } from "langchain/chains";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { Document } from "langchain/document";
import { CSVLoader } from "langchain/document_loaders/fs/csv";
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { OpenAI } from "langchain/llms/openai";
import { PromptTemplate } from "langchain/prompts";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { CHAT_MODELS, ChatAnswer } from "./models/chat";
import { DocumentsVector } from "./models/document";

import {
  maliciousPromptTemplate,
  promptInjectionEvalTemplate,
  qAcontextTemplate,
  retrievalQAPrePrompt,
} from "./promptTemplates";
import { LEVEL_NAMES } from "./models/level";
import { PromptEvaluationChainReply, QaChainReply } from "./models/langchain";

// store vectorised documents for each level as array
let vectorisedDocuments: DocumentsVector[] = [];

// set the global varibale
function setVectorisedDocuments(docs: DocumentsVector[]) {
  vectorisedDocuments = docs;
}

function getFilepath(currentLevel: LEVEL_NAMES) {
  let filePath = "resources/documents/";
  switch (currentLevel) {
    case LEVEL_NAMES.LEVEL_1:
      return (filePath += "level_1/");
    case LEVEL_NAMES.LEVEL_2:
      return (filePath += "level_2/");
    case LEVEL_NAMES.LEVEL_3:
      return (filePath += "level_3/");
    case LEVEL_NAMES.SANDBOX:
      return (filePath += "common/");
    default:
      console.error(`No document filepath found for level: ${filePath}`);
      return "";
  }
}
// load the documents from filesystem
async function getDocuments(filePath: string) {
  console.debug(`Loading documents from: ${filePath}`);

  const loader: DirectoryLoader = new DirectoryLoader(filePath, {
    ".pdf": (path: string) => new PDFLoader(path),
    ".txt": (path: string) => new TextLoader(path),
    ".csv": (path: string) => new CSVLoader(path),
  });
  const docs = await loader.load();

  // split the documents into chunks
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 0,
  });
  const splitDocs = await textSplitter.splitDocuments(docs);
  return splitDocs;
}

// join the configurable preprompt to the context template
function getQAPromptTemplate(prePrompt: string) {
  if (!prePrompt) {
    // use the default prePrompt
    prePrompt = retrievalQAPrePrompt;
  }
  const fullPrompt = prePrompt + qAcontextTemplate;
  console.debug(`QA prompt: ${fullPrompt}`);
  const template: PromptTemplate = PromptTemplate.fromTemplate(fullPrompt);
  return template;
}
// create and store the document vectors for each level
async function initDocumentVectors() {
  const docVectors: DocumentsVector[] = [];

  for (const value of Object.values(LEVEL_NAMES)) {
    if (!isNaN(Number(value))) {
      const level = value as LEVEL_NAMES;
      // get the documents
      const filePath: string = getFilepath(level);
      const documents: Document[] = await getDocuments(filePath);

      // embed and store the splits - will use env variable for API key
      const embeddings = new OpenAIEmbeddings();

      const vectorStore: MemoryVectorStore =
        await MemoryVectorStore.fromDocuments(documents, embeddings);
      // store the document vectors for the level
      docVectors.push({
        level: level,
        docVector: vectorStore,
      });
    }
  }
  setVectorisedDocuments(docVectors);
  console.debug(
    "Intitialised document vectors for each level. count=",
    vectorisedDocuments.length
  );
}

function initQAModel(
  level: LEVEL_NAMES,
  prePrompt: string,
  openAiApiKey: string
) {
  if (!openAiApiKey) {
    console.debug("No OpenAI API key set to initialise QA model");
    return;
  }
  const documentVectors = vectorisedDocuments[level].docVector;

  // initialise model
  const model = new ChatOpenAI({
    modelName: CHAT_MODELS.GPT_3_5_TURBO,
    streaming: true,
    openAIApiKey: openAiApiKey,
  });
  const promptTemplate = getQAPromptTemplate(prePrompt);

  return RetrievalQAChain.fromLLM(model, documentVectors.asRetriever(), {
    prompt: promptTemplate,
  });
}

// initialise the prompt evaluation model
function initPromptEvaluationModel(openAiApiKey: string) {
  if (!openAiApiKey) {
    console.debug(
      "No OpenAI API key set to initialise prompt evaluation model"
    );
    return;
  }
  // create chain to detect prompt injection
  const promptInjectionPrompt = PromptTemplate.fromTemplate(
    promptInjectionEvalTemplate
  );

  const promptInjectionChain = new LLMChain({
    llm: new OpenAI({
      modelName: CHAT_MODELS.GPT_3_5_TURBO,
      temperature: 0,
      openAIApiKey: openAiApiKey,
    }),
    prompt: promptInjectionPrompt,
    outputKey: "promptInjectionEval",
  });

  // create chain to detect malicious prompts
  const maliciousInputPrompt = PromptTemplate.fromTemplate(
    maliciousPromptTemplate
  );
  const maliciousInputChain = new LLMChain({
    llm: new OpenAI({
      modelName: CHAT_MODELS.GPT_3_5_TURBO,
      temperature: 0,
      openAIApiKey: openAiApiKey,
    }),
    prompt: maliciousInputPrompt,
    outputKey: "maliciousInputEval",
  });

  const sequentialChain = new SequentialChain({
    chains: [promptInjectionChain, maliciousInputChain],
    inputVariables: ["prompt"],
    outputVariables: ["promptInjectionEval", "maliciousInputEval"],
  });
  console.debug("Prompt evaluation chain initialised.");
  return sequentialChain;
}

// ask the question and return models answer
async function queryDocuments(
  question: string,
  prePrompt: string,
  currentLevel: LEVEL_NAMES,
  openAiApiKey: string
) {
  const qaChain = initQAModel(currentLevel, prePrompt, openAiApiKey);
  if (!qaChain) {
    console.debug("QA chain not initialised.");
    return { reply: "", questionAnswered: false };
  }

  // get start time
  const startTime = new Date().getTime();
  console.debug("Calling QA model...");
  const response = (await qaChain.call({
    query: question,
  })) as QaChainReply;
  // log the time taken
  const endTime = new Date().getTime();
  console.debug(`QA model call took ${endTime - startTime}ms`);

  console.debug(`QA model response: ${response.text}`);
  const result: ChatAnswer = {
    reply: response.text,
    questionAnswered: true,
  };
  return result;
}

// ask LLM whether the prompt is malicious
async function queryPromptEvaluationModel(input: string, openAIApiKey: string) {
  const promptEvaluationChain = initPromptEvaluationModel(openAIApiKey);
  if (!promptEvaluationChain) {
    console.debug("Prompt evaluation chain not initialised.");
    return { isMalicious: false, reason: "" };
  }
  console.log(`Checking '${input}' for malicious prompts`);

  // get start time
  const startTime = new Date().getTime();
  console.debug("Calling prompt evaluation model...");
  const response = (await promptEvaluationChain.call({
    prompt: input,
  })) as PromptEvaluationChainReply;
  // log the time taken
  const endTime = new Date().getTime();
  console.debug(`Prompt evaluation model call took ${endTime - startTime}ms`);

  const promptInjectionEval = formatEvaluationOutput(
    response.promptInjectionEval
  );
  const maliciousInputEval = formatEvaluationOutput(
    response.maliciousInputEval
  );
  console.debug(
    `Prompt injection eval: ${JSON.stringify(promptInjectionEval)}`
  );
  console.debug(`Malicious input eval: ${JSON.stringify(maliciousInputEval)}`);

  // if both are malicious, combine reason
  if (promptInjectionEval.isMalicious && maliciousInputEval.isMalicious) {
    return {
      isMalicious: true,
      reason: `${promptInjectionEval.reason} & ${maliciousInputEval.reason}`,
    };
  } else if (promptInjectionEval.isMalicious) {
    return { isMalicious: true, reason: promptInjectionEval.reason };
  } else if (maliciousInputEval.isMalicious) {
    return { isMalicious: true, reason: maliciousInputEval.reason };
  }
  return { isMalicious: false, reason: "" };
}

// format the evaluation model output. text should be a Yes or No answer followed by a reason
function formatEvaluationOutput(response: string) {
  try {
    // split response on first full stop or comma
    const splitResponse = response.split(/\.|,/);
    const answer = splitResponse[0]?.replace(/\W/g, "").toLowerCase();
    const reason = splitResponse[1]?.trim();
    return {
      isMalicious: answer === "yes",
      reason: reason,
    };
  } catch (error) {
    // in case the model does not respond in the format we have asked
    console.error(error);
    console.debug(
      `Did not get a valid response from the prompt evaluation model. Original response: ${response}`
    );
    return { isMalicious: false, reason: "" };
  }
}

export {
  initQAModel,
  getFilepath,
  getQAPromptTemplate,
  getDocuments,
  initPromptEvaluationModel,
  queryDocuments,
  queryPromptEvaluationModel,
  formatEvaluationOutput,
  setVectorisedDocuments,
  initDocumentVectors,
};
