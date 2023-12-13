import { DocumentMeta } from '@src/models/document';

import { getBackendUrl, sendRequestOld } from './backendService';

async function getDocumentMetas(): Promise<DocumentMeta[]> {
	const path = 'documents';
	const response = await sendRequestOld(path, 'GET');
	let documentMetas = (await response.json()) as DocumentMeta[];
	documentMetas = documentMetas.map((documentMeta) => {
		return {
			...documentMeta,
			uri: `${getBackendUrl()}${path}/${documentMeta.folder}/${
				documentMeta.filename
			}`,
		};
	});
	return documentMetas;
}

export { getDocumentMetas };
