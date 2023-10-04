import ThemedButton from "../ThemedButtons/ThemedButton";
import DocumentViewBox from "./DocumentViewBox";

import "./DocumentViewButton.css";
import { useState } from "react";

function DocumentViewButton() {
  const [showPopup, setShowPopup] = useState(false);

  return (
    <div id="document-view-button-area">
      <ThemedButton
        onClick={() => {
          setShowPopup(true);
        }}
      >
        View Documents
      </ThemedButton>
      <DocumentViewBox show={showPopup} setShow={setShowPopup} />
    </div>
  );
}

export default DocumentViewButton;
