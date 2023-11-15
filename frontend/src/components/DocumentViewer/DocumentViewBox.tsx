import { useEffect, useState } from "react";
import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";
import { DocumentMeta } from "../../models/document";
import { getDocumentMetas } from "../../service/documentService";

import "./DocumentViewBox.css";

function DocumentViewBox({
  show,
  onClose,
}: {
  show: boolean;
  onClose: () => void;
}) {
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
              documents={documentMetas}
              pluginRenderers={DocViewerRenderers}
            />
          </div>
        </div>
      </div>
    </div>
  ) : null;
}

export default DocumentViewBox;
