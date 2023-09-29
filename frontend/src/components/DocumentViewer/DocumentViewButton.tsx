import CustomButton from "../CustomButton/CustomButton";
import DocumentViewBox from "./DocumentViewBox";

import "./DocumentViewButton.css";
import { useState } from "react";

function DocumentViewButton() {
  const [showPopup, setShowPopup] = useState(false);

  return (
    <div id="document-view-button-area">
      <CustomButton
        text="View Documents"
        onClick={() => {
          setShowPopup(true);
        }}
      />
      <DocumentViewBox show={showPopup} setShow={setShowPopup} />
    </div>
  );
}

export default DocumentViewButton;
