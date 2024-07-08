import { IDocument } from '@cyntler/react-doc-viewer';

import { DocumentMeta } from '@src/models/document';

import { backendUrl } from './backendService';

const PATH = 'documents';

function processDocumentMetadata(docs: DocumentMeta[]) {
	const baseUrl = backendUrl();
	return docs.map(
		({ fileName, fileType, folder }) =>
			({
				fileName,
				fileType,
				uri: `${baseUrl}${PATH}/${folder}/${fileName}`,
			}) as IDocument
	);
}

export { processDocumentMetadata };
