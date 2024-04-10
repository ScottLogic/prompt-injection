import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { PHASE_NAMES } from "./phase";

interface Document {
  filename: string;
  filetype: string;
}

interface DocumentsVector {
  phase: PHASE_NAMES;
  docVector: MemoryVectorStore;
}

export type { Document, DocumentsVector };
