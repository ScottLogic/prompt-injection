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
                  <ThemedButton 
                  title="previous button"
                  onClick={previousDocument} 
                  disabled={state.currentFileNo === 0}
                  >
                  ◄
                  </ThemedButton>
                  <ThemedButton
                  title="next button"
                  onClick={nextDocument}
                  disabled={state.currentFileNo >= state.documents.length - 1}
                  >
                  ►
                  </ThemedButton>
              </div>
            </div>
        </div>
    </>
  );
};
