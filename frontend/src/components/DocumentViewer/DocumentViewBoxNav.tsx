import ThemedButton from '@src/components/ThemedButtons/ThemedButton';

import './DocumentViewBoxNav.css';

interface DocumentViewBoxNavProps {
	documentIndex: number;
	documentName: string;
	numberOfDocuments: number;
	onPrevious: () => void;
	onNext: () => void;
}

function DocumentViewBoxNav({
	documentIndex,
	documentName,
	numberOfDocuments,
	onPrevious,
	onNext,
}: DocumentViewBoxNavProps) {
	const documentNumber = `${documentIndex + 1} of ${numberOfDocuments}`;

	return (
		<div className="view-documents-nav">
			<nav className="button-container">
				<ThemedButton onClick={onPrevious} ariaDisabled={documentIndex <= 0}>
					<i aria-hidden>◄</i>&nbsp;previous document
				</ThemedButton>
				<div className="info">{documentNumber}</div>
				<ThemedButton
					onClick={onNext}
					ariaDisabled={documentIndex >= numberOfDocuments - 1}
				>
					next document&nbsp;<i aria-hidden>►</i>
				</ThemedButton>
			</nav>
			<p className="info">{documentName}</p>
		</div>
	);
}

export default DocumentViewBoxNav;
export type { DocumentViewBoxNavProps };
