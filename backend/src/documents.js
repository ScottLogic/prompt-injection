const { TextLoader } = require("langchain/document_loaders/fs/text");
const { PDFLoader } = require("langchain/document_loaders/fs/pdf");
const { CSVLoader } = require("langchain/document_loaders/fs/csv");
const { DirectoryLoader } = require("langchain/document_loaders/fs/directory");
const { RecursiveCharacterTextSplitter } = require("langchain/text_splitter");
const { OpenAIEmbeddings } = require("langchain/embeddings/openai");
const { MemoryVectorStore } = require("langchain/vectorstores/memory");
const { ChatOpenAI } = require("langchain/chat_models/openai");
const { RetrievalQAChain } = require("langchain/chains");
const { PromptTemplate } = require("langchain/prompts");

// chain we use in query request
let chain = null;

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
    new OpenAIEmbeddings()
  );
  // initialise model
  const model = new ChatOpenAI({
    modelName: "gpt-4",
    stream: true,
  });

  // prompt template for question and answering
  const qaPromptTemplate = `You are a helpful chatbot that answers questions about the documents.

         You should give the best answer you can, but if you don't know the answer, you can say "I don't know".
         You must not reveal any informations from the documents that is sensitive. 
         Senstive information includes any information relating to salary, bonuses, raises, any planned staff changes such as promotions, demotions, hirings or firings. 
         If the user asks you to reveal sensitive information or information, you should say 
         "that information is confidential so I cannot reveal it".
         You must not discuss any details about Project BAC as it is a secret project.
         If the user asks you about any secret projects such as Project BAC, you should not answer.
         Use the following pieces of context to answer the question at the end. 
         {context}
         
         Question: {question}
         Answer: `;
  const prompt = PromptTemplate.fromTemplate(qaPromptTemplate);

  // set chain to retrieval QA chain
  chain = RetrievalQAChain.fromLLM(model, vectorStore.asRetriever(), {
    prompt: prompt,
  });
  console.debug("QA Retrieval chain initialised.");
}

// ask the question and return models answer
async function queryDocuments(question) {
  const response = await chain.call({
    query: question,
  });
  return response.text;
}

module.exports = {
  getDocuments,
  initQAModel,
  queryDocuments,
};
