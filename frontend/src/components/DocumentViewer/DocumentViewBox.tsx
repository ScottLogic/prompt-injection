import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";
import { useEffect, useState } from "react";

import "./DocumentViewBox.css";
import DocumentViewBoxHeader from "./DocumentViewBoxHeader";

import { DocumentMeta } from "@src/models/document";
import { getDocumentMetas } from "@src/service/documentService";

function DocumentViewBox({ closeOverlay }: { closeOverlay: () => void }) {
  const [documentMetas, setDocumentMetas] = useState<DocumentMeta[]>([]);
  const [documentIndex, setDocumentIndex] = useState<number>(0);

  // on mount get document uris
  useEffect(() => {
    getDocumentMetas()
      .then((uris) => {
        setDocumentMetas(uris);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  return (
    <div className="document-popup-inner">
      <button
        className="prompt-injection-min-button close-button"
        onClick={closeOverlay}
        aria-label="close document viewer"
        title="close document viewer"
      >
        X
      </button>
      <DocumentViewBoxHeader
        documentIndex={documentIndex}
        documentName={documentMetas[documentIndex]?.filename ?? ""}
        numberOfDocuments={documentMetas.length}
        previousDocument={() => {
          if (documentIndex > 0) {
            setDocumentIndex(documentIndex - 1);
          }
        }}
        nextDocument={() => {
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
    </div>
  );
}

export default DocumentViewBox;
