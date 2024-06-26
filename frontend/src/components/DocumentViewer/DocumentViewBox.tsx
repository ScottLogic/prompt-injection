import DocViewer, { DocViewerRenderers } from '@cyntler/react-doc-viewer';
import { useEffect, useState } from 'react';

import OverlayHeader from '@src/components/Overlay/OverlayHeader';
import { DocumentMeta } from '@src/models/document';
import { documentService } from '@src/service';

import DocumentViewBoxNav from './DocumentViewBoxNav';

import './DocumentViewBox.css';

const emptyList: DocumentMeta[] = [];

function DocumentViewBox({ closeOverlay }: { closeOverlay: () => void }) {
	const [documentMetas, setDocumentMetas] = useState<DocumentMeta[]>(emptyList);
	const [documentIndex, setDocumentIndex] = useState<number>(0);

	// on mount get document uris
	useEffect(() => {
		const abortController = new AbortController();
		void documentService
			.getDocumentMetas(abortController.signal)
			.then((uris) => {
				setDocumentMetas(uris);
			})
			.catch((err: unknown) => {
				console.log(err);
			});
		return () => {
			abortController.abort('component unmounted');
		};
	}, []);

	return (
		<div className="document-popup-inner">
			<OverlayHeader
				closeOverlay={closeOverlay}
				heading="View Documents"
				iconColor="#FFF"
			/>
			<div className="view-documents-main">
				{documentMetas.length > 0 ? (
					<>
						<DocumentViewBoxNav
							documentIndex={documentIndex}
							documentName={documentMetas[documentIndex]?.filename ?? ''}
							numberOfDocuments={documentMetas.length}
							onPrevious={() => {
								if (documentIndex > 0) {
									setDocumentIndex(documentIndex - 1);
								}
							}}
							onNext={() => {
								if (documentIndex < documentMetas.length - 1) {
									setDocumentIndex(documentIndex + 1);
								}
							}}
						/>

						<div
							className="document-viewer-container"
							// eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
							tabIndex={0}
						>
							<DocViewer
								documents={documentMetas}
								activeDocument={documentMetas[documentIndex]}
								pluginRenderers={DocViewerRenderers}
								config={{
									header: {
										disableHeader: true,
									},
								}}
							/>
						</div>
					</>
				) : (
					<p>
						Unable to fetch documents. Try opening the document viewer again. If
						the problem persists, please contact support.
					</p>
				)}
			</div>
		</div>
	);
}

export default DocumentViewBox;
