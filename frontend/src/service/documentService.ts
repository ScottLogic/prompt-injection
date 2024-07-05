import { DocumentMeta } from '@src/models/document';

import { get, backendUrl } from './backendService';

const PATH = 'documents';

async function getDocumentMetas(signal: AbortSignal): Promise<DocumentMeta[]> {
	const response = await get(`${PATH}/`, { signal });
	const docs = (await response.json()) as DocumentMeta[];
	return docs.map((documentMeta) => {
		return {
			...documentMeta,
			uri: `${backendUrl()}${PATH}/${documentMeta.folder}/${
				documentMeta.filename
			}`,
		};
	});
}

export { getDocumentMetas };
