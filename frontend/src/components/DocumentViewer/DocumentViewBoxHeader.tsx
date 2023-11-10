import { IHeaderOverride } from "@cyntler/react-doc-viewer";
import ThemedButton from "../ThemedButtons/ThemedButton";

// eslint-disable-next-line func-style
export const MyHeader: IHeaderOverride = (state, previousDocument, nextDocument) => {
  if (!state.currentDocument || state.config?.header?.disableFileName) {
    return null;
  }

  const documentTitle = (state.currentDocument.uri).split('/').pop();
  const documentNumber = `Document ${(state.currentFileNo)+1} out of 6`


  return (
    <>
        <div className="view-documents-header">
            <h3>view documents</h3>
            <div className="doc-view-nav">
              {/* <div className="view-documents-current-document"> */}
                {documentTitle}
                {/* </div> */}
              <div className="doc-viewer-nav-buttons-container">
                {documentNumber}
                  <button 
                  title="previous button"
                  aria-label="previous document"
                  className="themed-button"
                  onClick={previousDocument} 
                  disabled={state.currentFileNo === 0}
                  >
                  ◄
                  </button>
                  <button
                  title="next button"
                  aria-label="next document"
                  className="themed-button"
                  onClick={nextDocument}
                  disabled={state.currentFileNo >= state.documents.length - 1}
                  >
                  ►
                  </button>
              </div>
            </div>
        </div>
    </>
  );
};
