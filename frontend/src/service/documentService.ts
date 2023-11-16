import { getBackendUrl, sendRequest } from './backendService';

import { RemoteDocument } from '@src/models/document';

async function getDocumentUris(): Promise<RemoteDocument[]> {
	const path = 'documents';
	const response = await sendRequest(path, 'GET');
	let documents = (await response.json()) as RemoteDocument[];
	documents = documents.map((document) => {
		return {
			...document,
			uri: `${getBackendUrl()}${path}/${document.filename}`,
		};
	});
	return documents;
}

export { getDocumentUris };
