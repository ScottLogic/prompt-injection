import { OpenAIEmbeddings } from '@langchain/openai';
import { CSVLoader } from 'langchain/document_loaders/fs/csv';
import {
	DirectoryLoader,
	UnknownHandling,
} from 'langchain/document_loaders/fs/directory';
import { TextLoader } from 'langchain/document_loaders/fs/text';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import * as fs from 'node:fs';

import { DocumentMeta, DocumentsVector } from './models/document';
import { LEVEL_NAMES } from './models/level';

// load the documents from filesystem
async function getDocuments(filePath: string) {
	console.debug(`Loading documents from: ${filePath}`);

	const loader: DirectoryLoader = new DirectoryLoader(
		filePath,
		{
			'.txt': (path: string) => new TextLoader(path),
			// CSV loader returns one document per row
			'.csv': (path: string) => new CSVLoader(path),
		},
		true,
		UnknownHandling.Warn
	);
	const docs = await loader.load();
	console.debug(`${docs.length} documents found`);

	return new RecursiveCharacterTextSplitter().splitDocuments(docs);
}

function getFilepath(target: LEVEL_NAMES | 'common') {
	const documentDir = 'resources/documents/';
	switch (target) {
		case LEVEL_NAMES.LEVEL_1:
			return `${documentDir}level_1/`;
		case LEVEL_NAMES.LEVEL_2:
			return `${documentDir}level_2/`;
		case LEVEL_NAMES.LEVEL_3:
			return `${documentDir}level_3/`;
		case LEVEL_NAMES.SANDBOX:
			return `${documentDir}sandbox/`;
		case 'common':
			return `${documentDir}common/`;
		default:
			console.error(
				'Failed to get document file path: Unknown target: ',
				target
			);
			return '';
	}
}

function getSandboxDocumentMetas() {
	return [...getDocumentMetas('common'), ...getDocumentMetas('sandbox')];
}

function getDocumentMetas(folder: string) {
	const filepath = `resources/documents/${folder}`;
	const documentMetas: DocumentMeta[] = [];

	fs.readdirSync(filepath).forEach((file) => {
		const fileType = file.split('.').pop() ?? '';
		documentMetas.push({
			filename: file,
			filetype: fileType === 'csv' ? 'text/csv' : fileType,
			folder,
		});
	});
	return documentMetas;
}

// store vectorised documents for each level as array
const documentVectors = (() => {
	let docs: DocumentsVector[] = [];
	return {
		get: () => docs,
		set: (newDocs: DocumentsVector[]) => {
			docs = newDocs;
		},
	};
})();
const getDocumentVectors = documentVectors.get;

// create and store the document vectors for each level
async function initDocumentVectors() {
	const docVectors: DocumentsVector[] = [];
	const commonDocuments = await getDocuments(getFilepath('common'));

	const levelValues = Object.values(LEVEL_NAMES);

	for (const level of levelValues) {
		const commonAndLevelDocuments = commonDocuments.concat(
			await getDocuments(getFilepath(level))
		);

		// embed and store the splits - will use env variable for API key
		const docVector = await MemoryVectorStore.fromDocuments(
			commonAndLevelDocuments,
			new OpenAIEmbeddings()
		);

		docVectors.push({
			level,
			docVector,
		});
	}
	documentVectors.set(docVectors);
	console.debug(
		`Initialised document vectors for each level. count=${docVectors.length}`
	);
}

export { getSandboxDocumentMetas, initDocumentVectors, getDocumentVectors };
