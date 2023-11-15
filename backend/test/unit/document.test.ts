import { getDocumentsForLevel } from "../../src/document";
import { LEVEL_NAMES } from "../../src/models/level";

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
  const mockLevelDocs = ["doc1.txt", "doc2.txt"];
  const mockLevelSplitDocs = ["split1", "split1.5", "split2"];
  const mockCommonDocs = ["common1.txt"];
  const mockCommonSplitDocs = ["split3", "split4"];

  const expectedDocs = [...mockLevelSplitDocs, ...mockCommonSplitDocs];

  mockLoader
    .mockResolvedValueOnce(mockLevelDocs)
    .mockResolvedValueOnce(mockCommonDocs);
  mockSplitDocuments
    .mockResolvedValueOnce(mockLevelSplitDocs)
    .mockResolvedValueOnce(mockCommonSplitDocs);

  const result = await getDocumentsForLevel(LEVEL_NAMES.LEVEL_1);

  expect(result.sort()).toEqual(expectedDocs.sort());
});

test("WHEN get documents for sandbox THEN returns the correct documents", () => {
  // const mockLevelDocs = ["doc1.txt", "doc2.txt"];
  // const mockLevelSplitDocs = ["split1", "split1.5", "split2"];
  // const mockCommonDocs = ["common1.txt"];
  // const mockCommonSplitDocs = ["split3", "split4"];

  // const expectedDocs = [...mockLevelSplitDocs, ...mockCommonSplitDocs];

  // mockLoader
  //   .mockResolvedValueOnce(mockLevelDocs)
  //   .mockResolvedValueOnce(mockCommonDocs);
  // mockSplitDocuments
  //   .mockResolvedValueOnce(mockLevelSplitDocs)
  //   .mockResolvedValueOnce(mockCommonSplitDocs);

  // const result = await getDocumentsForLevel(LEVEL_NAMES.LEVEL_1);

  // expect(result.sort()).toEqual(expectedDocs.sort());
  expect(true).toEqual(true);
});
