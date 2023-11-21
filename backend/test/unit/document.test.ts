import { getDocumentsForLevel } from "@src/document";
import { LEVEL_NAMES } from "@src/models/level";

const mockLoader = jest.fn();
const mockSplitDocuments = jest.fn();

// mock DirectoryLoader
jest.mock("langchain/document_loaders/fs/directory", () => {
  return {
    DirectoryLoader: jest.fn().mockImplementation(() => {
      return {
        load: mockLoader,
      };
    }),
  };
});

// mock RecursiveCharacterTextSplitter
jest.mock("langchain/text_splitter", () => {
  return {
    RecursiveCharacterTextSplitter: jest.fn().mockImplementation(() => {
      return {
        splitDocuments: mockSplitDocuments,
      };
    }),
  };
});

test("WHEN get documents for a level THEN returns the correct documents", async () => {
  const mockLevelSplitDocs = ["split1", "split1.5", "split2"];
  const mockCommonSplitDocs = ["split3", "split4"];

  const expectedDocs = [...mockLevelSplitDocs, ...mockCommonSplitDocs];

  mockLoader.mockResolvedValue([]);
  mockSplitDocuments
    .mockResolvedValueOnce(mockLevelSplitDocs)
    .mockResolvedValueOnce(mockCommonSplitDocs);

  const result = await getDocumentsForLevel(LEVEL_NAMES.LEVEL_1);

  expect(result.sort()).toEqual(expectedDocs.sort());
});
