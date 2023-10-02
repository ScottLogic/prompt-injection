import CustomButton from "../CustomButton/CustomButton";
import DocumentViewBox from "./DocumentViewBox";

import "./DocumentViewButton.css";
import { useState } from "react";

function DocumentViewButton() {
  const [showPopup, setShowPopup] = useState(false);

  return (
    <div id="document-view-button-area">
      <CustomButton
        onClick={() => {
          setShowPopup(true);
        }}
      >
        View Documents
      </CustomButton>
      <DocumentViewBox show={showPopup} setShow={setShowPopup} />
    </div>
  );
}

export default DocumentViewButton;
