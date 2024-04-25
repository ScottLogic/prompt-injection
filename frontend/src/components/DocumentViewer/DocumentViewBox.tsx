import DocViewer, {
	TXTRenderer,
	CSVRenderer,
	IDocument,
} from '@cyntler/react-doc-viewer';
import { useEffect, useState } from 'react';

import OverlayHeader from '@src/components/Overlay/OverlayHeader';
import { documentService } from '@src/service';

import DocumentViewBoxNav from './DocumentViewBoxNav';

import './DocumentViewBox.css';

const emptyList: IDocument[] = [];

// Use our own loader that handles auth
TXTRenderer.fileLoader = documentService.fetchDocument;
CSVRenderer.fileLoader = documentService.fetchDocument;

function DocumentViewBox({ closeOverlay }: { closeOverlay: () => void }) {
	const [documentMetas, setDocumentMetas] = useState<IDocument[]>(emptyList);
	const [documentIndex, setDocumentIndex] = useState<number>(0);

	// on mount get document uris
	useEffect(() => {
		const abortController = new AbortController();
		void documentService
			.getDocumentMetas(abortController.signal)
			.then((docs) => {
				setDocumentMetas(docs);
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
							documentName={documentMetas[documentIndex]?.fileName ?? ''}
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
								pluginRenderers={[TXTRenderer, CSVRenderer]}
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
