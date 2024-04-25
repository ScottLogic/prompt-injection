import { FileLoaderFuncProps, IDocument } from '@cyntler/react-doc-viewer';

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

/**
 * Remote fetcher compatible with ReactDocViewer, but using our own
 * {@link get} fetch wrapper to handle authentication.
 *
 * ReactDocViewer provides a `headers` param for use cases such as auth, but as
 * authentication for SpyLogic is opt-in via request Interceptors, that doesn't
 * work nicely for us - we'd need two separate mechanisms for setting auth 😖.
 *
 * A {@link FileReader} is used to read the response as a blob, passing the
 * reader back to the DocRenderer via loader callback `fileLoaderComplete`.
 *
 * Do not call this function directly! Instead set it as fileLoader on your
 * DocRenderer, e.g. `TXTRenderer.fileLoader = fetchDocument;`
 *
 * @param documentURI See {@link FileLoaderFuncProps}
 * @param signal See {@link FileLoaderFuncProps}
 * @param fileLoaderComplete See {@link FileLoaderFuncProps}
 */
function fetchDocument({
	documentURI,
	signal,
	fileLoaderComplete,
}: FileLoaderFuncProps) {
	void get(documentURI, { signal })
		.then((response) =>
			response.blob().then((blob) => {
				const fileReader = new FileReader();
				fileReader.addEventListener('loadend', () => {
					fileLoaderComplete(fileReader);
				});
				fileReader.readAsText(blob);
			})
		)
		.catch((reason: unknown) => {
			// Aborted requests are OK if using AbortController / AbortSignal
			if (!(reason instanceof DOMException) || reason.name !== 'AbortError') {
				// In all other cases release the error, to be handled downstream
				throw reason;
			}
		});
}

export { fetchDocument, getDocumentMetas };
