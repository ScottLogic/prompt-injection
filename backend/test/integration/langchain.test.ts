import { PromptTemplate } from "langchain/prompts";
import {
  initQAModel,
  //   initPromptEvaluationModel,
  //   queryDocuments,
  //   queryPromptEvaluationModel,
} from "../../src/langchain";
import {
  retrievalQAPrePrompt,
  qAcontextTemplate,
} from "../../src/promptTemplates";

// import { PromptTemplate } from "langchain/prompts";

// mock OpenAIEmbeddings
jest.mock("langchain/embeddings/openai", () => {
  return {
    OpenAIEmbeddings: jest.fn().mockImplementation(() => {
      return {
        init: jest.fn(),
      };
    }),
  };
});

jest.mock("langchain/vectorstores/memory", () => {
  const mockAsRetriever = jest.fn();
  class MockMemoryVectorStore {
    async asRetriever() {
      mockAsRetriever();
    }
  }
  return {
    MemoryVectorStore: {
      fromDocuments: jest.fn(() =>
        Promise.resolve(new MockMemoryVectorStore())
      ),
    },
  };
});

// mock DirectoryLoader
jest.mock("langchain/document_loaders/fs/directory", () => {
  return {
    DirectoryLoader: jest.fn().mockImplementation(() => {
      return {
        load: jest.fn(),
      };
    }),
  };
});

// mock RecursiveCharacterTextSplitter
jest.mock("langchain/text_splitter", () => {
  return {
    RecursiveCharacterTextSplitter: jest.fn().mockImplementation(() => {
      return {
        splitDocuments: jest.fn(),
      };
    }),
  };
});

// mock PromptTemplate.fromTemplate static method
// jest.mock("langchain/prompts", () => {
//   return {
//     PromptTemplate: {
//       fromTemplate: jest.fn(); ,
//     },
//   };
// });

// mock OpenAI for ChatOpenAI class
jest.mock("langchain/chat_models/openai");

// mock RetrievalQAChain
jest.mock("langchain/llms/openai", () => {
  return {
    RetrievalQAChain: {
      fromLLM: jest.fn(),
    },
  };
});

test("GIVEN the QA model is not provided a prompt and currentPhase WHEN it is initialised THEN the prompt is set to the default and documents are set for sandbox phase", () => {
  initQAModel("test-api-key", "");

  const expectedPrompt = retrievalQAPrePrompt + qAcontextTemplate;
  const mockFromTemplate = jest.fn().mockReturnValue({});
  PromptTemplate.fromTemplate = mockFromTemplate;
  expect(mockFromTemplate).toHaveBeenCalledWith(expectedPrompt);
});

// test("GIVEN the QA model is provided a prompt and currentPhase WHEN it is initialised THEN the prompt is set to the correct prompt and the documents are set to correctly", () => {});

// test("GIVEN the QA model is initilised WHEN a question is asked THEN it answers ", () => {});

// test("GIVEN the QA model is not initialised WHEN a question is asked THEN it returns an empty response ", () => {});

// test("GIVEN the prompt evaluation model WHEN it is initialised THEN the promptEvaluationChain is initialised with a SequentialChain LLM", () => {});

// test("GIVEN the prompt evaluation model is not initialised WHEN it is asked to evaluate an input it returns an empty response", () => {});

// test("GIVEN the prompt evaluation model is initialised WHEN it is asked to evaluate an input AND it responds in the correct format THEN it returns a final decision and reason", () => {});

// test("GIVEN the prompt evaluation model is initialised WHEN it is asked to evaluate an input AND it does not respond in the correct format THEN it returns a final decision of false", () => {});
