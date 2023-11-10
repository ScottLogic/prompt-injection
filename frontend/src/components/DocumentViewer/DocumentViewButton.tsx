import ThemedButton from "../ThemedButtons/ThemedButton";

import "./DocumentViewButton.css";

function DocumentViewButton({
  openDocumentViewer
}: {
  openDocumentViewer: () => void;
}) {

  return (
    <div className="document-view-button-wrapper">
      <ThemedButton onClick={openDocumentViewer}>
        View Documents
      </ThemedButton>
    </div>
  );
}

export default DocumentViewButton;
