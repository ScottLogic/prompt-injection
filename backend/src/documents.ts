import { Document } from "langchain/document";
import { CSVLoader } from "langchain/document_loaders/fs/csv";
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { LEVEL_NAMES } from "./models/level";

async function getDocumentsForLevel(level: LEVEL_NAMES) {
  const levelDocuments =
    level === LEVEL_NAMES.SANDBOX
      ? await getAllLevelSpecificDocuments()
      : await getLevelSpecificDocuments(level);

  const commonDocsFilePath: string = getFilepath("common");
  const commonDocuments: Document[] = await getDocuments(commonDocsFilePath);

  const documents = commonDocuments.concat(levelDocuments);
  return documents;
}

async function getAllLevelSpecificDocuments() {
  const levelValues = Object.values(LEVEL_NAMES)
    .filter((value) => !isNaN(Number(value)))
    .map((value) => Number(value));

  const documents: Document[] = [];
  for (const level of levelValues) {
    const levelSpecificDocuments = await getLevelSpecificDocuments(level);
    documents.push(...levelSpecificDocuments);
  }
  return documents;
}

async function getLevelSpecificDocuments(level: LEVEL_NAMES) {
  const levelDocsFilePath: string = getFilepath(level);
  return await getDocuments(levelDocsFilePath);
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

function getFilepath(target: LEVEL_NAMES | "common") {
  let filePath = "resources/documents/";
  switch (target) {
    case LEVEL_NAMES.LEVEL_1:
      return (filePath += "level_1/");
    case LEVEL_NAMES.LEVEL_2:
      return (filePath += "level_2/");
    case LEVEL_NAMES.LEVEL_3:
      return (filePath += "level_3/");
    case LEVEL_NAMES.SANDBOX:
      return (filePath += "sandbox/");
    case "common":
      return (filePath += "common/");
    default:
      console.error(`No document filepath found: ${filePath}`);
      return "";
  }
}

export { getDocumentsForLevel };
