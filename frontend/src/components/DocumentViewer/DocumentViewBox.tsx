import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";
import { useEffect, useState } from "react";

import { RemoteDocument } from "@src/models/document";
import { getDocumentUris } from "@src/service/documentService";

import "./DocumentViewBox.css";

function DocumentViewBox({
  show,
  onClose,
}: {
  show: boolean;
  onClose: () => void;
}) {
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

  return show ? (
    <div className="document-popup">
      <div className="document-popup-inner">
        <button
          className="prompt-injection-min-button close-button"
          onClick={onClose}
          aria-label="close document viewer"
        >
          X
        </button>
        <div className="content">
          <div className="view-documents-header">
            <h3>view documents</h3>
          </div>
          <div className="view-documents-body">
            <DocViewer
              className="document-viewer"
              documents={documents}
              pluginRenderers={DocViewerRenderers}
            />
          </div>
        </div>
      </div>
    </div>
  ) : null;
}

export default DocumentViewBox;
