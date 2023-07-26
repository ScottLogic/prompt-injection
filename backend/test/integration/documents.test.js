const { DirectoryLoader } = require("langchain/document_loaders/fs/directory");
const { RecursiveCharacterTextSplitter } = require("langchain/text_splitter");
const { OpenAIEmbeddings } = require("langchain/embeddings/openai");
const { MemoryVectorStore } = require("langchain/vectorstores/memory");
const { ChatOpenAI } = require("langchain/chat_models/openai");
const { RetrievalQAChain } = require("langchain/chains");
const { PromptTemplate } = require("langchain/prompts");
const { getDocuments } = require("../../src/documents");

// mock the directory loader 
jest.mock("langchain/document_loaders/fs/directory");
const mockLoaderLoad = jest.fn();
DirectoryLoader.mockImplementation(() => {
  return {
    load: mockLoaderLoad,
  };
});

// mock the recursive text splitter
jest.mock("langchain/text_splitter");
const mockSplitterSplitDocuments = jest.fn();
RecursiveCharacterTextSplitter.mockImplementation(() => {
  return {
    splitDocuments: mockSplitterSplitDocuments,
  }
});

// mock the memory vector store
jest.mock("langchain/vectorstores/memory");
MemoryVectorStore.fromDocuments.mockImplementation(async () => {
  console.log("Mocked memory vector store from documents");
  return mockVectorStore;
});

// mock the embeddings
jest.mock("langchain/embeddings/openai");
const mockEmbeddings = jest.fn();
OpenAIEmbeddings.mockImplementation(() => {
  return {
    embedDocuments: ["23456", "23456", "23456"],
  }
});

// mock the chat model
jest.mock("langchain/chat_models/openai");
const mockChatOpenAI = jest.fn();
ChatOpenAI.mockImplementation(() => {
  return {
    openAIApiKey: "key",
  }
});

// mock the retrieval QA chain 
jest.mock("langchain/chains");
const mockRetrievalQAChain = new RetrievalQAChain({ "model": "gpt-4" });
RetrievalQAChain.fromLLM.mockImplementation(() => {
  return mockRetrievalQAChain;
});

// mock the prompt template
jest.mock("langchain/prompts");
PromptTemplate.fromTemplate.mockImplementation(() => {
  return {
    prompt: "You are a helpful chatbot who answers questions about the documents",
  }
});

test("get documents loads files and splits into chunks", async () => {
  mockLoaderLoad.mockResolvedValueOnce(
    ["Bob is the CEO. He earns 30000 a year.", "Karen is getting a raise of 20%."])
  mockSplitterSplitDocuments.mockResolvedValueOnce(["Bob is the CEO.", "He earns 30000 a year.", "Karen is getting a raise of 20%."]);
  const documents = await getDocuments();
  expect(documents.length).toBe(3);
  expect(mockLoaderLoad).toHaveBeenCalledTimes(1);
  expect(mockSplitterSplitDocuments).toHaveBeenCalledTimes(1);

  mockLoaderLoad.mockRestore();
  mockSplitterSplitDocuments.mockRestore();
});


test("initQAModel loads documents and creates a QA chain", async () => {
  // to be implemented 
});

test("queryDocuments calls the QA chain and returns a text response", async () => {
  // to be implemented
});