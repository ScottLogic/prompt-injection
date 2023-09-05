import { useEffect, useState } from "react";
import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";
import { getDocumentUris } from "../../service/documentService";

import "./DocumentViewBox.css";
import { RemoteDocument } from "../../models/document";

function DocumentViewBox({
  show,
  setShow,
}: {
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [documents, setDocuments] = useState<RemoteDocument[]>([]);
  // on mount get document uris
  useEffect(() => {
    getDocumentUris().then((uris) => {
      setDocuments(uris);
    });
  }, []);

  return show ? (
    <div className="document-popup">
      <div className="document-popup-inner">
        <span className="close-button" onClick={() => setShow(false)}>
          x
        </span>
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
  ) : (
    ""
  );
}

export default DocumentViewBox;
