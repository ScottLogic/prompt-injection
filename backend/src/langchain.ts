import { ChatAnswer, ChatMalicious } from "./types/chat";
import { Session } from "./types/session";

const { TextLoader } = require("langchain/document_loaders/fs/text");
const { PDFLoader } = require("langchain/document_loaders/fs/pdf");
const { CSVLoader } = require("langchain/document_loaders/fs/csv");
const { DirectoryLoader } = require("langchain/document_loaders/fs/directory");
const { Document } = require("langchain/document");
const { RecursiveCharacterTextSplitter } = require("langchain/text_splitter");
const { OpenAIEmbeddings } = require("langchain/embeddings/openai");
const { MemoryVectorStore } = require("langchain/vectorstores/memory");
const { ChatOpenAI } = require("langchain/chat_models/openai");
const {
  ChainValues,
  RetrievalQAChain,
  LLMChain,
  SequentialChain,
} = require("langchain/chains");
const { PromptTemplate } = require("langchain/prompts");
const { OpenAI } = require("langchain/llms/openai");
const {
  retrievalQATemplate,
  promptInjectionEvalTemplate,
  maliciousPromptTemplate,
} = require("./promptTemplates");

// chain we use in question/answer request
let qaChain: typeof RetrievalQAChain = null;

// chain we use in prompt evaluation request
let promptEvaluationChain: typeof SequentialChain = null;

const getFilepath = (currentPhase: number): string => {
  let filePath = "resources/documents/";
  switch (currentPhase) {
    case 0:
      return (filePath += "phase_0/");
    case 1:
      return (filePath += "phase_1/");
    case 2:
      return (filePath += "phase_2/");
    default:
      return (filePath += "common/");
  }
};

// load the documents from filesystem
const getDocuments = async (filePath: string): Promise<(typeof Document)[]> => {
  console.debug("Loading documents from: " + filePath);

  const loader: typeof DirectoryLoader = new DirectoryLoader(filePath, {
    ".pdf": (path: string) => new PDFLoader(path),
    ".txt": (path: string) => new TextLoader(path),
    ".csv": (path: string) => new CSVLoader(path),
  });
  const docs: (typeof Document)[] = await loader.load();

  // split the documents into chunks
  const textSplitter: typeof RecursiveCharacterTextSplitter =
    new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 0,
    });
  const splitDocs: (typeof Document)[] = await textSplitter.splitDocuments(
    docs
  );
  return splitDocs;
};

// QA Chain - ask the chat model a question about the documents
const initQAModel = async (
  session: Session,
  currentPhase: number
): Promise<void> => {
  if (!session.apiKey) {
    console.debug("No apiKey set to initialise QA model");
    return;
  }
  // get the documents
  const docs: (typeof Document)[] = await getDocuments(
    getFilepath(currentPhase)
  );

  // embed and store the splits
  const embeddings: typeof OpenAIEmbeddings = new OpenAIEmbeddings({
    openAIApiKey: session.apiKey,
  });
  const vectorStore: typeof MemoryVectorStore =
    await MemoryVectorStore.fromDocuments(docs, embeddings);

  // initialise model
  const model: typeof ChatOpenAI = new ChatOpenAI({
    modelName: "gpt-4",
    stream: true,
    openAIApiKey: session.apiKey,
  });

  // prompt template for question and answering
  const qaPrompt: typeof PromptTemplate =
    PromptTemplate.fromTemplate(retrievalQATemplate);

  // set chain to retrieval QA chain
  qaChain = RetrievalQAChain.fromLLM(model, vectorStore.asRetriever(), {
    prompt: qaPrompt,
  });
};

// initialise the prompt evaluation model
const initPromptEvaluationModel = async (session: Session): Promise<void> => {
  if (!session.apiKey) {
    console.debug("No apiKey set to initialise prompt evaluation model");
    return;
  }

  // create chain to detect prompt injection
  const promptInjectionPrompt: typeof PromptTemplate =
    PromptTemplate.fromTemplate(promptInjectionEvalTemplate);

  const promptInjectionChain: typeof LLMChain = new LLMChain({
    llm: new OpenAI({
      model: "gpt-3.5-turbo",
      temperature: 0,
      openAIApiKey: session.apiKey,
    }),
    prompt: promptInjectionPrompt,
    outputKey: "promptInjectionEval",
  });

  // create chain to detect malicious prompts
  const maliciousInputPrompt: typeof PromptTemplate =
    PromptTemplate.fromTemplate(maliciousPromptTemplate);
  const maliciousInputChain: typeof LLMChain = new LLMChain({
    llm: new OpenAI({
      model: "gpt-3.5-turbo",
      temperature: 0,
      openAIApiKey: session.apiKey,
    }),
    prompt: maliciousInputPrompt,
    outputKey: "maliciousInputEval",
  });

  promptEvaluationChain = new SequentialChain({
    chains: [promptInjectionChain, maliciousInputChain],
    inputVariables: ["prompt"],
    outputVariables: ["promptInjectionEval", "maliciousInputEval"],
  });
  console.debug("Prompt evaluation chain initialised");
};

// ask the question and return models answer
const queryDocuments = async (question: string): Promise<ChatAnswer> => {
  if (!qaChain) {
    console.debug("QA chain not initialised.");
    return { reply: "", questionAnswered: false };
  }
  const response: typeof ChainValues = await qaChain.call({
    query: question,
  });
  console.debug("QA model response: " + response.text);
  const result: ChatAnswer = {
    reply: response.text,
    questionAnswered: true,
  };
  return result;
};

// ask LLM whether the prompt is malicious
const queryPromptEvaluationModel = async (
  input: string
): Promise<ChatMalicious> => {
  if (!promptEvaluationChain) {
    console.debug("Prompt evaluation chain not initialised.");
    return { isMalicious: false, reason: "" };
  }

  const response: typeof ChainValues = await promptEvaluationChain.call({
    prompt: input,
  });

  const promptInjectionEval: any = formatEvaluationOutput(
    response.promptInjectionEval
  );
  const maliciousInputEval: any = formatEvaluationOutput(
    response.maliciousInputEval
  );

  console.debug(
    "Prompt injection eval: " + JSON.stringify(promptInjectionEval)
  );
  console.debug("Malicious input eval: " + JSON.stringify(maliciousInputEval));

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
};

// format the evaluation model output. text should be a Yes or No answer followed by a reason
const formatEvaluationOutput = (response: any): any => {
  try {
    // split response on first full stop or comma
    const splitResponse: string[] = response.split(/\.|,/);
    const answer: string = splitResponse[0].replace(/\W/g, "").toLowerCase();
    const reason: string = splitResponse[1];
    return {
      isMalicious: answer === "yes",
      reason: reason,
    };
  } catch (error) {
    // in case the model does not respond in the format we have asked
    console.error(error);
    console.debug(
      "Did not get a valid response from the prompt evaluation model. Original response: " +
        response.text
    );
    return { isMalicious: false, reason: "" };
  }
};

module.exports = {
  getDocuments,
  initQAModel,
  initPromptEvaluationModel,
  queryDocuments,
  queryPromptEvaluationModel,
};
