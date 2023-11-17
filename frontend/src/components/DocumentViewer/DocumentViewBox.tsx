import DocViewer, {
  DocViewerRef,
  DocViewerRenderers,
} from "@cyntler/react-doc-viewer";
import { useEffect, useRef, useState } from "react";

import "./DocumentViewBox.css";
import { DocumentViewBoxHeader } from "./DocumentViewBoxHeader";

import { DocumentMeta } from "@src/models/document";
import { getDocumentMetas } from "@src/service/documentService";

function DocumentViewBox({ closeOverlay }: { closeOverlay: () => void }) {
  const docViewerRef = useRef<DocViewerRef>(null);
  const [documentMetas, setDocumentMetas] = useState<DocumentMeta[]>([]);

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
      <DocViewer
        documents={documentMetas}
        pluginRenderers={DocViewerRenderers}
        ref={docViewerRef}
        config={{
          header: {
            overrideComponent: DocumentViewBoxHeader,
          },
        }}
      />
    </div>
  );
}

export default DocumentViewBox;
