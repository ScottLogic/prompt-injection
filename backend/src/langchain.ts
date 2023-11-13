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
import { getOpenAIKey } from "./openai";

import {
  maliciousPromptEvalPrePrompt,
  maliciousPromptEvalMainPrompt,
  promptInjectionEvalPrePrompt,
  promptInjectionEvalMainPrompt,
  qAMainPrompt,
  qAPrePrompt,
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
      console.error(`No document filepath found: ${filePath}`);
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

  return await textSplitter.splitDocuments(docs);
}

// choose between the provided preprompt and the default preprompt and prepend it to the main prompt and return the PromptTemplate
function makePromptTemplate(
  configPrePrompt: string,
  defaultPrePrompt: string,
  mainPrompt: string,
  templateNameForLogging: string
) {
  if (!configPrePrompt) {
    // use the default prePrompt
    configPrePrompt = defaultPrePrompt;
  }
  const fullPrompt = `${configPrePrompt}\n${mainPrompt}`;
  console.debug(`${templateNameForLogging}: ${fullPrompt}`);
  return PromptTemplate.fromTemplate(fullPrompt);
}

// create and store the document vectors for each level
// eslint-disable-next-line @typescript-eslint/require-await
async function initDocumentVectors() {
  const docVectors: DocumentsVector[] = [];

  const levelValues = Object.values(LEVEL_NAMES)
    .filter((value) => !isNaN(Number(value)))
    .map((value) => Number(value));

  levelValues.map(async (level) => {
    // get the documents
    const filePath: string = getFilepath(level);
    const documents: Document[] = await getDocuments(filePath);

    // embed and store the splits - will use env variable for API key
    const embeddings = new OpenAIEmbeddings();

    const docVector: MemoryVectorStore = await MemoryVectorStore.fromDocuments(
      documents,
      embeddings
    );
    // store the document vectors for the level
    docVectors.push({
      level,
      docVector,
    });
  });
  setVectorisedDocuments(docVectors);
  console.debug(
    "Intitialised document vectors for each level. count=",
    docVectors.length
  );
}

function initQAModel(level: LEVEL_NAMES, prePrompt: string) {
  const openAIApiKey = getOpenAIKey();
  const documentVectors = vectorisedDocuments[level].docVector;

  // initialise model
  const model = new ChatOpenAI({
    modelName: CHAT_MODELS.GPT_3_5_TURBO,
    streaming: true,
    openAIApiKey,
  });
  const promptTemplate = makePromptTemplate(
    prePrompt,
    qAPrePrompt,
    qAMainPrompt,
    "QA prompt template"
  );

  return RetrievalQAChain.fromLLM(model, documentVectors.asRetriever(), {
    prompt: promptTemplate,
  });
}

// initialise the prompt evaluation model
function initPromptEvaluationModel(
  configPromptInjectionEvalPrePrompt: string,
  configMaliciousPromptEvalPrePrompt: string
) {
  const openAIApiKey = getOpenAIKey();

  // create chain to detect prompt injection
  const promptInjectionEvalTemplate = makePromptTemplate(
    configPromptInjectionEvalPrePrompt,
    promptInjectionEvalPrePrompt,
    promptInjectionEvalMainPrompt,
    "Prompt injection eval prompt template"
  );

  const promptInjectionChain = new LLMChain({
    llm: new OpenAI({
      modelName: CHAT_MODELS.GPT_3_5_TURBO,
      temperature: 0,
      openAIApiKey,
    }),
    prompt: promptInjectionEvalTemplate,
    outputKey: "promptInjectionEval",
  });

  // create chain to detect malicious prompts
  const maliciousPromptEvalTemplate = makePromptTemplate(
    configMaliciousPromptEvalPrePrompt,
    maliciousPromptEvalPrePrompt,
    maliciousPromptEvalMainPrompt,
    "Malicious input eval prompt template"
  );

  const maliciousInputChain = new LLMChain({
    llm: new OpenAI({
      modelName: CHAT_MODELS.GPT_3_5_TURBO,
      temperature: 0,
      openAIApiKey,
    }),
    prompt: maliciousPromptEvalTemplate,
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
  currentLevel: LEVEL_NAMES
) {
  const qaChain = initQAModel(currentLevel, prePrompt);

  // get start time
  const startTime = Date.now();
  console.debug("Calling QA model...");
  const response = (await qaChain.call({
    query: question,
  })) as QaChainReply;
  // log the time taken
  console.debug(`QA model call took ${Date.now() - startTime}ms`);

  console.debug(`QA model response: ${response.text}`);
  const result: ChatAnswer = {
    reply: response.text,
    questionAnswered: true,
  };
  return result;
}

// ask LLM whether the prompt is malicious
async function queryPromptEvaluationModel(
  input: string,
  configPromptInjectionEvalPrePrompt: string,
  configMaliciousPromptEvalPrePrompt: string
) {
  console.debug(`Checking '${input}' for malicious prompts`);
  const promptEvaluationChain = initPromptEvaluationModel(
    configPromptInjectionEvalPrePrompt,
    configMaliciousPromptEvalPrePrompt
  );

  // get start time
  const startTime = Date.now();
  console.debug("Calling prompt evaluation model...");
  const response = (await promptEvaluationChain.call({
    prompt: input,
  })) as PromptEvaluationChainReply;
  // log the time taken
  console.debug(
    `Prompt evaluation model call took ${Date.now() - startTime}ms`
  );

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
    const splitResponse = response.split(/[.,]/);
    const answer = splitResponse[0]?.replace(/\W/g, "").toLowerCase();
    const reason = splitResponse[1]?.trim();
    return {
      isMalicious: answer === "yes",
      reason,
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
  getDocuments,
  initPromptEvaluationModel,
  queryDocuments,
  queryPromptEvaluationModel,
  formatEvaluationOutput,
  setVectorisedDocuments,
  initDocumentVectors,
  makePromptTemplate,
};
