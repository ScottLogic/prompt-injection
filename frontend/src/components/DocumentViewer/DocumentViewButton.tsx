import DocumentViewBox from "./DocumentViewBox";

import "./DocumentViewButton.css";
import { useState } from "react";

function DocumentViewButton() {
  const [showPopup, setShowPopup] = useState(false);

  return (
    <div id="document-view-button-area">
      <button
        className="document-view-button"
        onClick={() => setShowPopup(true)}
      >
        View Documents
      </button>
      <DocumentViewBox show={showPopup} setShow={setShowPopup} />
    </div>
  );
}

export default DocumentViewButton;
