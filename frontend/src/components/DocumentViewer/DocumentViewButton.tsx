import ThemedButton from "../ThemedButtons/ThemedButton";
import DocumentViewBox from "./DocumentViewBox";

import "./DocumentViewButton.css";

function DocumentViewButton({
  closeOverlay,
  openOverlay
}: {
  closeOverlay: () => void;
  openOverlay: () => void;
}) {

  return (
    <div className="document-view-button-wrapper">
      <ThemedButton onClick={openOverlay}>
        View Documents
      </ThemedButton>
      <DocumentViewBox closeOverlay={closeOverlay}/>
    </div>
  );
}

export default DocumentViewButton;
