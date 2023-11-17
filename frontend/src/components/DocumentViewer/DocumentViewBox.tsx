import DocViewer, {
  DocViewerRef,
  DocViewerRenderers,
} from "@cyntler/react-doc-viewer";
import { useEffect, useRef, useState } from "react";

import "./DocumentViewBox.css";
import DocumentViewBoxHeader from "./DocumentViewBoxHeader";

import useIsOverflow from "@src/hooks/useIsOverflow";
import { DocumentMeta } from "@src/models/document";
import { getDocumentMetas } from "@src/service/documentService";

function DocumentViewBox({ closeOverlay }: { closeOverlay: () => void }) {
  const documentViewerRef = useRef<DocViewerRef>(null);
  const documentViewerContainerRef = useRef<HTMLDivElement>(null);

  const isOverflow = useIsOverflow(documentViewerContainerRef);

  const [documentMetas, setDocumentMetas] = useState<DocumentMeta[]>([]);
  const [documentIndex, setDocumentIndex] = useState<number>(0);
  const [documentName, setDocumentName] = useState<string>("");

  // on mount get document uris
  useEffect(() => {
    getDocumentMetas()
      .then((uris) => {
        setDocumentMetas(uris);
        if (uris.length > documentIndex) {
          setDocumentName(uris[documentIndex].filename);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  function onDocumentChange(document: DocumentMeta) {
    // const index = documentMetas.findIndex((doc) => doc.uri === document.uri);
    // console.log(
    //   "index",
    //   index,
    //   "document",
    //   document,
    //   "documentMetas",
    //   documentMetas
    // );
    setDocumentIndex(documentIndex + 1);
    // setDocumentName(document.filename);
  }

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
        documentName={documentName}
        numberOfDocuments={documentMetas.length}
        previousDocument={() => {
          documentViewerRef.current?.prev();
          // setDocumentIndex(documentIndex - 1);
        }}
        nextDocument={() => {
          documentViewerRef.current?.next();
          // setDocumentIndex(documentIndex + 1);
        }}
      />
      <div
        className="document-viewer-container"
        ref={documentViewerContainerRef}
        // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
        tabIndex={isOverflow ? 0 : undefined}
      >
        <DocViewer
          documents={documentMetas}
          pluginRenderers={DocViewerRenderers}
          ref={documentViewerRef}
          config={{
            header: {
              disableHeader: true,
            },
          }}
          // onDocumentChange={onDocumentChange}
        />
      </div>
    </div>
  );
}

export default DocumentViewBox;
