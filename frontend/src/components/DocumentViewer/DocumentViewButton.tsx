import PopUpBox from "./PopUpBox";

import "./DocumentViewButton.css";
import { useState } from "react";

function DocumentViewButton() {
  const [showPopup, setShowPopup] = useState(false);

  return (
    <div id="document-view-area">
      <button
        className="document-view-button"
        onClick={() => setShowPopup(true)}
      >
        View Documents
      </button>
      <PopUpBox show={showPopup} setShow={setShowPopup} />
    </div>
  );
}

export default DocumentViewButton;
