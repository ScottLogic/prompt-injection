import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";

import "./DocumentViewBox.css";

function DocumentViewBox({
  show,
  setShow,
}: {
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const docPath = "/documents/";

  fetch(docPath)
    .then((res) => res.text())
    .then((data) => console.log(data));

  const documents = [
    { uri: "/documents/company_info.txt", fileType: "txt" },
    { uri: "/documents/expenses.csv", fileType: "text/csv" },
    { uri: "/documents/employee_info.csv", fileType: "text/csv" },
    { uri: "/documents/project_bongo.txt", fileType: "txt" },
    { uri: "/documents/project_kazoo.txt", fileType: "txt" },
    { uri: "/documents/project_piccolo.txt", fileType: "txt" },
  ];

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
