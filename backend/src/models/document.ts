import { MemoryVectorStore } from 'langchain/vectorstores/memory';

import { LEVEL_NAMES } from './level';

interface DocumentMeta {
	fileName: string;
	fileType: string;
	folder: string;
}

interface DocumentsVector {
	level: LEVEL_NAMES;
	docVector: MemoryVectorStore;
}

export type { DocumentMeta, DocumentsVector };
