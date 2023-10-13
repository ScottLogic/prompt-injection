import ThemedButton from "../ThemedButtons/ThemedButton";
import DocumentViewBox from "./DocumentViewBox";

import "./DocumentViewButton.css";
import { useState } from "react";

function DocumentViewButton() {
  const [showPopup, setShowPopup] = useState(false);

  return (
    <div className="document-view-button-wrapper">
      <ThemedButton
        onClick={() => {
          setShowPopup(true);
        }}
      >
        View Documents
      </ThemedButton>
      <DocumentViewBox
        show={showPopup}
        onClose={() => {
          setShowPopup(false);
        }}
      />
    </div>
  );
}

export default DocumentViewButton;
