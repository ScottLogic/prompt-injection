import { DocumentMeta } from '@src/models/document';

import { getBackendUrl, sendRequest } from './backendService';

const PATH = 'documents';

async function getDocumentMetas(signal?: AbortSignal): Promise<DocumentMeta[]> {
	const response = await sendRequest(PATH, { method: 'GET', signal });
	let documentMetas = (await response.json()) as DocumentMeta[];
	documentMetas = documentMetas.map((documentMeta) => {
		return {
			...documentMeta,
			uri: `${getBackendUrl()}${PATH}/${documentMeta.folder}/${
				documentMeta.filename
			}`,
		};
	});
	return documentMetas;
}

export { getDocumentMetas };
