import { IHeaderOverride } from "@cyntler/react-doc-viewer";
import ThemedButton from "../ThemedButtons/ThemedButton";
import "./DocumentViewBoxHeader.css";

// eslint-disable-next-line func-style
export const DocumentViewBoxHeader: IHeaderOverride = (
  state,
  previousDocument,
  nextDocument
) => {
  if (!state.currentDocument || state.config?.header?.disableFileName) {
    return null;
  }

  const documentName = state.currentDocument.uri.split("/").pop();
  const documentNumber = `${state.currentFileNo + 1} out of ${state.documents.length}`;

  return (
    <>
      <div className="view-documents-header">
        <h2>view documents</h2>
        <div className="view-documents-nav">
          <p className="view-documents-info">{documentName}</p>
          <p className="view-documents-info">{documentNumber}</p>
          <div className="view-documents-button-container">
            {state.currentFileNo > 0 && (
              <span className="previous-document">
                <ThemedButton onClick={previousDocument}>
                  ◄ previous document
                </ThemedButton>
              </span>
            )}
            {state.currentFileNo < state.documents.length - 1 && (
              <span className="next-document">
                <ThemedButton onClick={nextDocument}>
                  next document ►
                </ThemedButton>
              </span>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
