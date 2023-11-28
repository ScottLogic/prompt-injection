import ThemedButton from '@src/components/ThemedButtons/ThemedButton';

import { DocumentViewBoxHeaderProps } from './DocumentViewBoxHeaderProps';

import './DocumentViewBoxHeader.css';

function DocumentViewBoxHeader({
	documentIndex,
	documentName,
	numberOfDocuments,
	onPrevious,
	onNext,
}: DocumentViewBoxHeaderProps) {
	const documentNumber = `${documentIndex + 1} out of ${numberOfDocuments}`;

	return (
		<div className="view-documents-header">
			<h2>view documents</h2>
			<div className="nav">
				<p className="info">{documentName}</p>
				<p className="info">{documentNumber}</p>
				<div className="button-container">
					<ThemedButton onClick={onPrevious} ariaDisabled={documentIndex <= 0}>
						<i aria-hidden>◄</i>&nbsp;previous document
					</ThemedButton>
					<ThemedButton
						onClick={onNext}
						ariaDisabled={documentIndex >= numberOfDocuments - 1}
					>
						next document&nbsp;<i aria-hidden>►</i>
					</ThemedButton>
				</div>
			</div>
		</div>
	);
}

export default DocumentViewBoxHeader;
