import { useEffect, useRef, useState } from "react";
import DocViewer, { DocViewerRef, DocViewerRenderers } from "@cyntler/react-doc-viewer";
import { RemoteDocument } from "../../models/document";
import { getDocumentUris } from "../../service/documentService";

import "./DocumentViewBox.css";
import { DocumentViewBoxHeader } from "./DocumentViewBoxHeader";

function DocumentViewBox({
  closeOverlay
}: {
  closeOverlay: () => void;
}) {
  const docViewerRef = useRef<DocViewerRef>(null);
  const [documents, setDocuments] = useState<RemoteDocument[]>([]);
  // on mount get document uris
  useEffect(() => {
    getDocumentUris()
      .then((uris) => {
        setDocuments(uris);
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
        <div className="content">
          <div className="view-documents-body">
            <DocViewer
              className="document-viewer"
              documents={documents}
              pluginRenderers={DocViewerRenderers}
              ref={docViewerRef}
              config={{
                header: {
                  overrideComponent: DocumentViewBoxHeader,
                },
              }}
            />
          </div>
        </div>
      </div>
  );
}

export default DocumentViewBox;
