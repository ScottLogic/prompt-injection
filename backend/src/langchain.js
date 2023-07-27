const { TextLoader } = require("langchain/document_loaders/fs/text");
const { PDFLoader } = require("langchain/document_loaders/fs/pdf");
const { CSVLoader } = require("langchain/document_loaders/fs/csv");
const { DirectoryLoader } = require("langchain/document_loaders/fs/directory");
const { RecursiveCharacterTextSplitter } = require("langchain/text_splitter");
const { OpenAIEmbeddings } = require("langchain/embeddings/openai");
const { MemoryVectorStore } = require("langchain/vectorstores/memory");
const { ChatOpenAI } = require("langchain/chat_models/openai");
const { RetrievalQAChain, LLMChain, SequentialChain } = require("langchain/chains");
const { PromptTemplate } = require("langchain/prompts");
const { OpenAI } = require("langchain/llms/openai");

const { retrievalQATemplate, promptInjectionEvalTemplate, maliciousPromptTemplate } = require("./promptTemplates");
// chain we use in question/answer request
let qaChain = null;

// chain we use in prompt evaluation request
let promptEvaluationChain = null;

// load the documents from filesystem
async function getDocuments() {
  const filePath = "resources/documents/";
  const loader = new DirectoryLoader(filePath, {
    ".pdf": (path) => new PDFLoader(path),
    ".txt": (path) => new TextLoader(path),
    ".csv": (path) => new CSVLoader(path),
  });
  const docs = await loader.load();

  // split the documents into chunks
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 0,
  });
  const splitDocs = await textSplitter.splitDocuments(docs);

  console.debug(
    "Documents loaded and split. Number of chunks: " + splitDocs.length
  );

  return splitDocs;
}

// QA Chain - ask the chat model a question about the documents
async function initQAModel() {
  // get the documents
  const docs = await getDocuments();

  // embed and store the splits
  const embeddings = new OpenAIEmbeddings();
  const vectorStore = await MemoryVectorStore.fromDocuments(
    docs,
    embeddings,
  );
  // initialise model
  const model = new ChatOpenAI({
    modelName: "gpt-4",
    stream: true,
  });

  // prompt template for question and answering
  const qaPrompt = PromptTemplate.fromTemplate(retrievalQATemplate);

  // set chain to retrieval QA chain
  qaChain = RetrievalQAChain.fromLLM(model, vectorStore.asRetriever(), {
    prompt: qaPrompt,
  });
  console.debug("QA Retrieval chain initialised.");
}


// initialise the prompt evaluation model
async function initPromptEvaluationModel() {

  // create chain to detect prompt injection
  const promptInjectionPrompt = PromptTemplate.fromTemplate(promptInjectionEvalTemplate);

  const promptInjectionChain = new LLMChain({ 
    llm: new OpenAI({ model: "gpt-3.5-turbo", temperature: 0 }), 
    prompt: promptInjectionPrompt,
    outputKey: "promptInjectionEval"
  });

  // create chain to detect malicious prompts
  const maliciousInputPrompt = PromptTemplate.fromTemplate(maliciousPromptTemplate);
  const maliciousInputChain = new LLMChain({ 
    llm: new OpenAI({ model: "gpt-3.5-turbo", temperature: 0 }), 
    prompt: maliciousInputPrompt,
    outputKey: "maliciousInputEval"
  });

  promptEvaluationChain = new SequentialChain({
    chains: [promptInjectionChain, maliciousInputChain],
    inputVariables: ['prompt'],
    outputVariables: ["promptInjectionEval", "maliciousInputEval"],
  });
  console.debug("Prompt evaluation chain initialised.");
}


// ask the question and return models answer
async function queryDocuments(question) {
  const response = await qaChain.call({
    query: question,
  });
  console.debug("QA model response: " + response.text);
  const result = {
    reply: response.text,
    questionAnswered: true,
  };
  return result;
}

// ask LLM whether the prompt is malicious
async function queryPromptEvaluationModel(input) {
  const response = await promptEvaluationChain.call({ prompt: input });

  const promptInjectionEval = formatEvaluationOutput(response.promptInjectionEval);
  const maliciousInputEval = formatEvaluationOutput(response.maliciousInputEval);

  console.debug("promptInjectionEval: " + JSON.stringify(promptInjectionEval));
  console.debug("maliciousInputEval: " + JSON.stringify(maliciousInputEval));

  if (promptInjectionEval.isMalicious) {
    if (maliciousInputEval.isMalicious) {
      // both models say yes, combine reason
      return { isMalicious: true, reason: promptInjectionEval.reason + " & " + maliciousInputEval.reason };
    }
    return { isMalicious: true, reason: promptInjectionEval.reason };
  } else {
    if (maliciousInputEval.isMalicious){
      return { isMalicious: true, reason: maliciousInputEval.reason };
    }
  }
  return {isMalicious: false, reason: ""}
}

// format the evaluation model output. text should be a Yes or No answer followed by a reason
function formatEvaluationOutput(response){
  try {
    // split response on first full stop or comma
    const splitResponse = response.split(/\.|,/);
    const answer = splitResponse[0].replace(/\W/g, '').toLowerCase();
    const reason = splitResponse[1];
    return {
      isMalicious: answer === "yes",
      reason: reason,
    }

  } catch (error) {
    // in case the model does not respond in the format we have asked
    console.error(error);
    console.debug("Did not get a valid response from the prompt evaluation model. Original response: " + response.text);
    return { isMalicious: false, reason: "" };
  }
}

module.exports = {
  getDocuments,
  initQAModel,
  initPromptEvaluationModel,
  queryDocuments,
  queryPromptEvaluationModel
};
