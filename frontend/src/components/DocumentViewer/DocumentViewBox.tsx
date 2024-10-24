import DocViewer, {
	TXTRenderer,
	CSVRenderer,
	IDocument,
} from '@cyntler/react-doc-viewer';
import { useState } from 'react';
import { ThreeDots } from 'react-loader-spinner';

import OverlayHeader from '@src/components/Overlay/OverlayHeader';
import { documentService } from '@src/service';

import DocumentViewBoxNav from './DocumentViewBoxNav';

import './DocumentViewBox.css';

// Use our own loader that handles auth
TXTRenderer.fileLoader = documentService.fetchDocument;
CSVRenderer.fileLoader = documentService.fetchDocument;

function DocumentViewBox({
	documents,
	closeOverlay,
}: {
	documents?: IDocument[];
	closeOverlay: () => void;
}) {
	const [documentIndex, setDocumentIndex] = useState<number>(0);
	return (
		<div className="document-popup-inner">
			<OverlayHeader
				closeOverlay={closeOverlay}
				heading="View Documents"
				iconColor="#FFF"
			/>
			<div className="view-documents-main">
				{!documents ? (
					<ThreeDots
						width="6rem"
						color="white"
						wrapperClass="loading"
						// blank label as by default the label is 'three-dots-loading'
						ariaLabel=""
					/>
				) : documents.length === 0 ? (
					<p className="error-message">
						Unable to fetch documents. Try opening the document viewer again. If
						the problem persists, please contact support.
					</p>
				) : (
					<>
						<DocumentViewBoxNav
							documentIndex={documentIndex}
							documentName={documents[documentIndex]?.fileName ?? ''}
							numberOfDocuments={documents.length}
							onPrevious={() => {
								if (documentIndex > 0) {
									setDocumentIndex(documentIndex - 1);
								}
							}}
							onNext={() => {
								if (documentIndex < documents.length - 1) {
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
								documents={documents}
								activeDocument={documents[documentIndex]}
								pluginRenderers={[TXTRenderer, CSVRenderer]}
								config={{
									header: {
										disableHeader: true,
									},
								}}
							/>
						</div>
					</>
				)}
			</div>
		</div>
	);
}

export default DocumentViewBox;
