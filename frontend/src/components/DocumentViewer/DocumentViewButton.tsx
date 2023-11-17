import "./DocumentViewButton.css";

import ThemedButton from "@src/components/ThemedButtons/ThemedButton";

function DocumentViewButton({
  openDocumentViewer,
}: {
  openDocumentViewer: () => void;
}) {
  return (
    <div className="document-view-button-wrapper">
      <ThemedButton onClick={openDocumentViewer}>View Documents</ThemedButton>
    </div>
  );
}

export default DocumentViewButton;
