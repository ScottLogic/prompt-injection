import { IDocument } from '@cyntler/react-doc-viewer';

import { DocumentMeta } from '@src/models/document';

import { get, backendUrl } from './backendService';

const PATH = 'documents';

async function getDocumentMetas(signal: AbortSignal): Promise<IDocument[]> {
	const response = await get(`${PATH}/`, { signal });
	const docs = (await response.json()) as DocumentMeta[];
	return docs.map((documentMeta) => {
		const { fileName, fileType, folder } = documentMeta;
		return {
			fileName,
			fileType,
			uri: `${backendUrl()}${PATH}/${folder}/${fileName}`,
		};
	});
}

export { getDocumentMetas };
