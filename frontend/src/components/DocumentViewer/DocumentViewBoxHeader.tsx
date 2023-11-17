import "./DocumentViewBoxHeader.css";

import ThemedButton from "@src/components/ThemedButtons/ThemedButton";

function DocumentViewBoxHeader({
  documentIndex,
  documentName,
  numberOfDocuments,
  previousDocument,
  nextDocument,
}: {
  documentIndex: number;
  documentName: string;
  numberOfDocuments: number;
  previousDocument: () => void;
  nextDocument: () => void;
}) {
  // const documentName = state.currentDocument.uri.split("/").pop();
  const documentNumber = `${documentIndex + 1} out of ${numberOfDocuments}`;

  return (
    <div className="view-documents-header">
      <h2>view documents</h2>
      <div className="nav">
        <p className="info">{documentName}</p>
        <p className="info">{documentNumber}</p>
        <div className="button-container">
          {documentIndex > 0 && (
            <span className="previous-document">
              <ThemedButton onClick={previousDocument}>
                ◄ previous document
              </ThemedButton>
            </span>
          )}
          {documentIndex < numberOfDocuments - 1 && (
            <span className="next-document">
              <ThemedButton onClick={nextDocument}>
                next document ►
              </ThemedButton>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default DocumentViewBoxHeader;
