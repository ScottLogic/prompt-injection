import "./DocumentViewBoxHeader.css";

import ThemedButton from "@src/components/ThemedButtons/ThemedButton";

function DocumentViewBoxHeader({
  documentIndex,
  documentName,
  numberOfDocuments,
  onPrevious,
  onNext,
}: {
  documentIndex: number;
  documentName: string;
  numberOfDocuments: number;
  onPrevious: () => void;
  onNext: () => void;
}) {
  const documentNumber = `${documentIndex + 1} out of ${numberOfDocuments}`;

  return (
    <div className="view-documents-header">
      <h2>view documents</h2>
      <div className="nav">
        <p className="info">{documentName}</p>
        <p className="info">{documentNumber}</p>
        <div className="button-container">
          <ThemedButton onClick={onPrevious} ariaDisabled={documentIndex <= 0}>
            ◄ previous document
          </ThemedButton>
          <ThemedButton
            onClick={onNext}
            ariaDisabled={documentIndex >= numberOfDocuments - 1}
          >
            next document ►
          </ThemedButton>
        </div>
      </div>
    </div>
  );
}

export default DocumentViewBoxHeader;
