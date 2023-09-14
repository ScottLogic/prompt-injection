import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { LEVEL_NAMES } from "./level";

interface Document {
  filename: string;
  filetype: string;
}

interface DocumentsVector {
  level: LEVEL_NAMES;
  docVector: MemoryVectorStore;
}

export type { Document, DocumentsVector };
